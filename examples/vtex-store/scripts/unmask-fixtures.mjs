#!/usr/bin/env node
/**
 * Replaces redacted fixture values (`"field": "M*******"`) with realistic
 * synthetic data so the local preview shows something coherent.
 *
 * Run once after copying fixtures from refs/vtex-email-framework/source/
 * data/vtex/. Idempotent — re-running doesn't change unmasked values
 * (only masked ones with `*` characters get replaced).
 *
 * Uses a single Brazilian persona across all 13 fixtures for visual
 * consistency. Production VTEX overrides everything at send time;
 * these values only affect the preview iframe.
 */

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EMAILS_DIR = path.join(__dirname, '..', 'emails');

// ─── Persona + product catalog ────────────────────────────────────────────

const persona = {
  firstName: 'Marina',
  lastName: 'Santos',
  fullName: 'Marina Santos',
  email: 'marina.santos@example.com.br',
  phone: '+5511987654321',
  document: '123.456.789-01',
  corporateDocument: '12.345.678/0001-90',
};

const address = {
  street: 'Rua Augusta',
  number: '1234',
  complement: 'Apto 502',
  neighborhood: 'Consolação',
  city: 'São Paulo',
  state: 'SP',
  postalCode: '01304-001',
  country: 'BRA',
};

const store = {
  TradingName: 'Loja Exemplo',
  CompanyName: 'Loja Exemplo Comércio LTDA',
  MainAccountName: 'lojaexemplo',
  AccountName: 'lojaexemplo',
  hostName: 'lojaexemplo',
  merchantName: 'Loja Exemplo',
};

const products = [
  'Tênis Esportivo Run Pro',
  'Camiseta Polo Premium',
  'Calça Jeans Slim',
  'Mochila Urbana 25L',
  'Relógio Inteligente Series 8',
  'Fone de Ouvido Wireless',
  'Jaqueta Corta-Vento',
  'Carteira Slim Couro',
  'Boné Snapback',
  'Óculos de Sol Aviador',
  'Tênis Casual Daily',
  'Camiseta Básica Algodão',
];

const brands = ['Nike', 'Adidas', 'Puma', 'Reserva', 'Polo Wear', 'Levi`s', 'Vans'];

const paymentSystems = ['Mastercard', 'Visa', 'Boleto Bancário', 'Pix', 'American Express'];

const couriers = [
  'Correios',
  'Total Express',
  'Loggi',
  'Mercado Envios',
  'JadLog',
  'Sequoia Logística',
];

const courierEventDescriptions = [
  'Objeto postado',
  'Em trânsito para a unidade de tratamento',
  'Encaminhado para unidade de distribuição',
  'Saiu para entrega ao destinatário',
  'Entregue ao destinatário',
];

const pickupStores = [
  {
    friendlyName: 'Loja Exemplo · Vila Madalena',
    street: 'Rua Aspicuelta',
    number: '320',
    neighborhood: 'Vila Madalena',
    city: 'São Paulo',
  },
  {
    friendlyName: 'Loja Exemplo · Jardins',
    street: 'Alameda Lorena',
    number: '1500',
    neighborhood: 'Jardim Paulista',
    city: 'São Paulo',
  },
  {
    friendlyName: 'Loja Exemplo · Pinheiros',
    street: 'Rua dos Pinheiros',
    number: '498',
    neighborhood: 'Pinheiros',
    city: 'São Paulo',
  },
];

// ─── Per-field replacement strategy ───────────────────────────────────────

let productIdx = 0;
let brandIdx = 0;
let paymentIdx = 0;
let courierIdx = 0;
let pickupIdx = 0;
let eventIdx = 0;

const fieldStrategy = {
  // Personal
  firstName: () => persona.firstName,
  lastName: () => persona.lastName,
  receiverName: () => persona.fullName,
  email: () => persona.email,
  followUpEmail: () =>
    `notify+${Math.random().toString(36).slice(2, 10)}@${store.hostName}.example.com.br`,
  phone: () => persona.phone,
  document: () => persona.document,
  corporateDocument: () => persona.corporateDocument,

  // Address
  street: () => address.street,
  number: () => address.number,
  complement: () => address.complement,
  neighborhood: () => address.neighborhood,
  city: () => address.city,
  state: () => address.state,
  postalCode: () => address.postalCode,
  country: () => address.country,

  // Store
  TradingName: () => store.TradingName,
  CompanyName: () => store.CompanyName,
  MainAccountName: () => store.MainAccountName,
  AccountName: () => store.AccountName,
  hostName: () => store.hostName,
  merchantName: () => store.merchantName,

  // Catalog
  name: () => products[productIdx++ % products.length],
  brandName: () => brands[brandIdx++ % brands.length],

  // Payment
  paymentSystemName: () => paymentSystems[paymentIdx++ % paymentSystems.length],

  // Shipping / courier
  courierName: () => couriers[courierIdx++ % couriers.length],
  accountCarrierName: () => couriers[courierIdx++ % couriers.length],
  courier: () => couriers[courierIdx++ % couriers.length],
  description: () => courierEventDescriptions[eventIdx++ % courierEventDescriptions.length],
  friendlyName: () => pickupStores[pickupIdx++ % pickupStores.length].friendlyName,

  // URLs / IDs (best-effort generic)
  link: () => 'https://lojaexemplo.example.com.br/checkout/cart/add',
};

const hasMask = (s) => typeof s === 'string' && s.includes('*');

/** Walk JSON and replace masked string values whose key is in the strategy map. */
function unmask(value, parentKey) {
  if (Array.isArray(value)) {
    return value.map((item) => unmask(item, parentKey));
  }
  if (value && typeof value === 'object') {
    const out = {};
    for (const [key, v] of Object.entries(value)) {
      out[key] = unmask(v, key);
    }
    return out;
  }
  if (hasMask(value) && parentKey && fieldStrategy[parentKey]) {
    return fieldStrategy[parentKey]();
  }
  return value;
}

// ─── Run across all fixtures ──────────────────────────────────────────────

const fixtures = readdirSync(EMAILS_DIR).filter((f) => f.endsWith('.json'));
let totalReplaced = 0;

for (const file of fixtures) {
  // Reset per-file counters so each template's data sequence is stable
  // and seeded by file contents rather than global state.
  productIdx = brandIdx = paymentIdx = courierIdx = pickupIdx = eventIdx = 0;

  const filepath = path.join(EMAILS_DIR, file);
  const raw = readFileSync(filepath, 'utf-8');
  const before = (raw.match(/\*/g) || []).length;
  const data = JSON.parse(raw);
  const cleaned = unmask(data);
  const newJson = `${JSON.stringify(cleaned, null, 2)}\n`;
  writeFileSync(filepath, newJson);
  const after = (newJson.match(/\*/g) || []).length;
  const replaced = before - after;
  totalReplaced += replaced;
  console.log(`  ${file}  replaced ${replaced} masked values`);
}

console.log(
  `\n✓ Done. ${totalReplaced} masked values replaced across ${fixtures.length} fixtures.`
);
