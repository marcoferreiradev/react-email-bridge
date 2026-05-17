import path from 'node:path';
import { Heading, Text } from '../components';
import CodeSnippet from '../components/code-snippet';
import { Shell } from '../components/shell';
import { emailsDirectoryAbsolutePath } from './env';

export default function Home() {
  const baseEmailsDirectoryName = path.basename(emailsDirectoryAbsolutePath);

  return (
    <Shell>
      <div className="w-full h-full flex items-center justify-center p-8">
        <div className="-mt-10 relative max-w-lg flex flex-col items-center gap-4 text-center">
          <div
            className="mb-2 flex items-center justify-center text-slate-12"
            style={{
              width: 120,
              height: 120,
              borderRadius: 28,
              background:
                'linear-gradient(135deg, rgba(79, 70, 229, 0.18), rgba(34, 211, 238, 0.18))',
              boxShadow: '0 0.625rem 5rem 0.5rem rgba(79, 70, 229, 0.25)',
            }}
          >
            <svg width="64" height="64" viewBox="0 0 32 32" fill="none">
              <rect
                x="2"
                y="6"
                width="28"
                height="20"
                rx="3"
                stroke="currentColor"
                strokeWidth="1.6"
                fill="none"
              />
              <path
                d="M4 9l12 8 12-8"
                stroke="currentColor"
                strokeWidth="1.6"
                fill="none"
                strokeLinejoin="round"
              />
              <text
                x="16"
                y="23"
                textAnchor="middle"
                fontFamily="ui-sans-serif, system-ui, sans-serif"
                fontSize="6"
                fontWeight="700"
                fill="currentColor"
                letterSpacing="0.5"
              >
                {`{{ }}`}
              </text>
            </svg>
          </div>
          <Heading as="h2" size="6" weight="medium">
            Welcome to react-email-bridge
          </Heading>
          <Text as="p">
            To start developing your emails, create a{' '}
            <CodeSnippet>.tsx</CodeSnippet> file under your{' '}
            <CodeSnippet>{baseEmailsDirectoryName}</CodeSnippet> folder.
            Add a <CodeSnippet>.json</CodeSnippet> fixture with the same
            basename to enable live preview against real data.
          </Text>
        </div>
      </div>
    </Shell>
  );
}
