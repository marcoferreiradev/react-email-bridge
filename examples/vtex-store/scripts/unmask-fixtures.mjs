#!/usr/bin/env node
/**
 * Sanitize fixture data so the local preview shows a single coherent
 * Brazilian persona (Marina Santos · São Paulo · Loja Exemplo).
 *
 * Two reasons the canonical VTEX fixtures from `refs/vtex-email-framework/
 * source/data/vtex/` look bad in preview:
 *
 *   1) Some had personal data redacted with `*` chars ('M*****',
 *      'L*********', 'C***** A******* d* B***** A****') — unreadable.
 *   2) Others ship with raw PII from real customers — 'TANIA REGINA DIAS
 *      S PEREIRA', 'RUA DR RAIMUNDO MAGALDI', etc.
 *
 * Both fail validation: you can't tell if the template renders correctly
 * when fields are noise.
 *
 * Fix: for identity / address / store fields, ALWAYS overwrite with the
 * Marina persona. For catalog fields (product names, brands, couriers,
 * payment systems), only replace if the source was masked — keep real
 * source data where it exists.
 *
 * Idempotent on already-replaced values (Marina, Rua Augusta, etc. are
 * left alone on re-run).
 */

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EMAILS_DIR = path.join(__dirname, '..', 'emails');

// ─── Persona ──────────────────────────────────────────────────────────────

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

const brands = ['Nike', 'Adidas', 'Puma', 'Reserva', 'Polo Wear', "Levi's", 'Vans'];

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
];

// ─── Field strategy ───────────────────────────────────────────────────────

let productIdx = 0;
let brandIdx = 0;
let paymentIdx = 0;
let courierIdx = 0;
let pickupIdx = 0;
let eventIdx = 0;

/**
 * Fields that ALWAYS get the persona value, regardless of whether the
 * source was masked or had real data. Privacy + visual consistency.
 */
const alwaysReplace = {
  // Personal identity
  firstName: () => persona.firstName,
  lastName: () => persona.lastName,
  receiverName: () => persona.fullName,
  email: () => persona.email,
  followUpEmail: () =>
    `notify+${Math.random().toString(36).slice(2, 10)}@${store.hostName}.example.com.br`,
  phone: () => persona.phone,
  document: () => persona.document,
  corporateDocument: () => persona.corporateDocument,

  // Address (top-level + addresses[] items)
  street: () => address.street,
  number: () => address.number,
  complement: () => address.complement,
  neighborhood: () => address.neighborhood,
  city: () => address.city,
  state: () => address.state,
  postalCode: () => address.postalCode,
  country: () => address.country,

  // Store identity
  TradingName: () => store.TradingName,
  CompanyName: () => store.CompanyName,
  MainAccountName: () => store.MainAccountName,
  AccountName: () => store.AccountName,
  hostName: () => store.hostName,
  merchantName: () => store.merchantName,

  // Pickup store name (when path is pickupStoreInfo.*)
  friendlyName: () => pickupStores[pickupIdx++ % pickupStores.length].friendlyName,

  // SLA labels — VTEX source has "Entrega estándar" (Spanish); use PT-BR
  selectedSla: () => 'Entrega padrão',

  // back-in-stock fixture ships with lorem placeholders. Always override
  // for that template + any other that uses product* fields.
  productName: () => 'Tênis Esportivo Run Pro',
  productLink: () => 'https://lojaexemplo.example.com.br/p/tenis-esportivo-run-pro',
  productDescription: () =>
    'Tênis ideal para corrida urbana e treinos intensos. ' +
    'Sistema de amortecimento responsivo, cabedal em mesh respirável ' +
    'e solado em borracha de alta durabilidade. Disponível em diversas ' +
    'cores e numerações.',
};

/**
 * Fields that only get replaced when the source was masked. Preserves
 * real-looking source data (product names like "LENCO VISCOSE...") that
 * isn't PII and is useful as a real example.
 *
 * Exception: `name` is handled specially below since it appears in both
 * seller and product contexts.
 */
const replaceIfMasked = {
  brandName: () => brands[brandIdx++ % brands.length],
  paymentSystemName: () => paymentSystems[paymentIdx++ % paymentSystems.length],
  courierName: () => couriers[courierIdx++ % couriers.length],
  accountCarrierName: () => couriers[courierIdx++ % couriers.length],
  courier: () => couriers[courierIdx++ % couriers.length],
  description: () => courierEventDescriptions[eventIdx++ % courierEventDescriptions.length],
  link: () => 'https://lojaexemplo.example.com.br/checkout/cart/add',
  // Catalog name variants
  productName: () => products[productIdx++ % products.length],
  skuName: () => products[productIdx++ % products.length],
  // Login / handle
  userName: () => 'marina.santos',
};

const hasMask = (s) => typeof s === 'string' && s.includes('*');

/**
 * Path-aware `name` handler. The `name` field appears in many contexts:
 *   - sellers[].name        → store/marketplace seller name → "Loja Exemplo"
 *   - items[].name          → product name → rotated from `products`
 *   - pickupStoreInfo.name  → pickup store name → rotated from `pickupStores`
 *   - paymentData.transactions[].payments[].name → leave alone
 */
function resolveName(pathStack, value) {
  // sellers context — direct parent or grandparent is "sellers"
  if (pathStack.includes('sellers')) return store.TradingName;
  // items context — replace masked, leave real
  if (pathStack.includes('items') || pathStack.includes('bundleItems')) {
    return hasMask(value) ? products[productIdx++ % products.length] : value;
  }
  // pickupStoreInfo context
  if (pathStack.includes('pickupStoreInfo')) {
    return pickupStores[pickupIdx++ % pickupStores.length].friendlyName;
  }
  // Default: replace only if masked
  return hasMask(value) ? products[productIdx++ % products.length] : value;
}

/** Recursive walk with parent path stack. */
function sanitize(value, pathStack) {
  if (Array.isArray(value)) {
    return value.map((item) => sanitize(item, pathStack));
  }
  if (value && typeof value === 'object') {
    const out = {};
    for (const [key, v] of Object.entries(value)) {
      out[key] = sanitize(v, [...pathStack, key]);
    }
    return out;
  }
  const key = pathStack[pathStack.length - 1];

  // alwaysReplace also fires on null/empty for address & identity fields,
  // since VTEX fixtures often null complement/neighborhood, which renders
  // as "- São Paulo - SP" with leading dashes.
  if (alwaysReplace[key]) {
    if (typeof value === 'string') return alwaysReplace[key]();
    if (value === null || value === '') return alwaysReplace[key]();
  }

  if (typeof value === 'string') {
    if (key === 'name') return resolveName(pathStack, value);
    if (hasMask(value) && replaceIfMasked[key]) return replaceIfMasked[key]();
  }
  return value;
}

// ─── Run ──────────────────────────────────────────────────────────────────

const fixtures = readdirSync(EMAILS_DIR).filter((f) => f.endsWith('.json'));

for (const file of fixtures) {
  // Reset per-file counters so each template's data sequence is stable.
  productIdx = brandIdx = paymentIdx = courierIdx = pickupIdx = eventIdx = 0;

  const filepath = path.join(EMAILS_DIR, file);
  const raw = readFileSync(filepath, 'utf-8');
  const before = (raw.match(/\*/g) || []).length;
  const data = JSON.parse(raw);
  const cleaned = sanitize(data, []);
  const newJson = `${JSON.stringify(cleaned, null, 2)}\n`;
  writeFileSync(filepath, newJson);
  const after = (newJson.match(/\*/g) || []).length;
  console.log(`  ${file}  masks: ${before} → ${after}`);
}

console.log(`\n✓ Sanitized ${fixtures.length} fixtures.`);
