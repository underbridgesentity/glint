import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Glint · Privacy Policy',
  description: 'How Glint collects, uses, and protects your personal information.',
};

const SECTIONS: { h: string; p: string[] }[] = [
  {
    h: 'Who we are',
    p: ['Glint provides app-led car care at demarcated stations in South African estates and office parks. This policy explains how we handle your personal information in line with the Protection of Personal Information Act (POPIA).'],
  },
  {
    h: 'What we collect',
    p: [
      'Account details: your name, mobile number, and email.',
      'Vehicle details: make, model, colour, and licence plate.',
      'Booking & wash records: slots, service tier, drop-off and collection codes, timestamps, and before/after proof photos.',
      'Payment details are processed by our payment provider (PayFast). We do not store your full card number.',
    ],
  },
  {
    h: 'How we use it',
    p: [
      'To take and fulfil your bookings, verify the secure handover of your vehicle, send you status notifications, process payments, and improve the service.',
      'We do not sell your personal information.',
    ],
  },
  {
    h: 'Who we share it with',
    p: ['Service providers who help us operate (hosting, SMS/WhatsApp, payments) under appropriate data-processing terms, and only as needed to deliver the service. We may disclose information where required by law.'],
  },
  {
    h: 'Where it is stored',
    p: ['Data is hosted on managed infrastructure in the EU. Cross-border processing is carried out with appropriate safeguards and your consent, consistent with POPIA.'],
  },
  {
    h: 'Your rights',
    p: ['You may access, correct, or delete your personal information. You can delete your account and associated data at any time in the app under Profile → Delete account, which permanently removes your profile, vehicles, and history.'],
  },
  {
    h: 'Retention',
    p: ['We keep your information for as long as your account is active or as needed to provide the service and meet legal obligations, after which it is deleted or anonymised.'],
  },
  {
    h: 'Contact',
    p: ['Questions or requests about your data: privacy@glint.co.za.'],
  },
];

export default function Privacy() {
  return (
    <div className="wrap" style={{ paddingTop: 80, paddingBottom: 100, maxWidth: 760 }}>
      <a href="/" className="g-label" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: 24 }}>← Glint</a>
      <h1 className="g-h1" style={{ fontSize: 'clamp(34px,6vw,52px)' }}>Privacy Policy</h1>
      <p className="g-meta" style={{ marginTop: 12 }}>Last updated 15 June 2026</p>

      {SECTIONS.map((s) => (
        <section key={s.h} style={{ marginTop: 40 }}>
          <h2 className="g-h3" style={{ fontSize: 20, marginBottom: 12 }}>{s.h}</h2>
          {s.p.map((para, i) => (
            <p key={i} className="g-body" style={{ fontSize: 15, marginBottom: 10 }}>{para}</p>
          ))}
        </section>
      ))}
    </div>
  );
}
