import React from 'react';

function ServicesTab() {
  return (
    <div className="screen" id="page-services">
      <div
        className="mb-5 rounded-[12px]"
        style={{
          minHeight: '180px',
          padding: '20px',
          background: 'linear-gradient(135deg, #0f3460 0%, #185FA5 60%, #1D9E75 100%)',
        }}
      >
        <span
          className="inline-block text-white"
          style={{
            background: 'rgba(255,255,255,0.15)',
            fontSize: '10px',
            padding: '3px 10px',
            borderRadius: '999px',
          }}
        >
          Software for Indian Business
        </span>
        <h2 className="mt-2 text-[22px] font-semibold leading-[1.3] text-white">
          Automate your business.
          <br />
          Build your idea.
        </h2>
        <p className="mt-2 text-[12px] leading-[1.5] text-white" style={{ opacity: 0.85 }}>
          Custom apps and digital tools for factories, traders and growing businesses across Punjab and India
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {['Fast delivery', 'Mobile-first', 'Made for India'].map((pill) => (
            <span
              key={pill}
              className="inline-block text-white"
              style={{
                background: 'rgba(255,255,255,0.15)',
                fontSize: '10px',
                padding: '4px 10px',
                borderRadius: '999px',
              }}
            >
              {pill}
            </span>
          ))}
        </div>
      </div>

      <div className="section">
        <div className="section-label">WHAT WE BUILD</div>
        <div className="grid grid-cols-2 gap-2 mb-5">
          {[
            { icon: '📱', title: 'Business Apps', desc: 'Custom mobile apps for your factory, shop or field team' },
            { icon: '🧮', title: 'Calculators & Tools', desc: 'Automate daily calculations your team does manually' },
            { icon: '📊', title: 'Dashboards', desc: 'Live reports and data for smarter decisions' },
            { icon: '🔗', title: 'Integrations', desc: 'Connect WhatsApp, GST, Tally and more' },
          ].map((item) => (
            <div key={item.title} className="rounded-lg bg-gray-100 px-3 py-3 text-gray-800">
              <div className="text-[20px]">{item.icon}</div>
              <div className="mt-2 text-[13px] font-medium">{item.title}</div>
              <div className="mt-1 text-[11px] leading-[1.5] text-gray-600">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="section pb-5">
        <div className="section-label">GET IN TOUCH</div>
        <div className="text-[15px] font-medium text-gray-900">
          Have an app idea or want to automate your business?
        </div>
        <p className="mt-1 text-[13px] leading-[1.6] text-gray-600">
          Whether you want to digitise your factory operations, build a custom business app, or request a new feature or add-on in
          Mill Calc — fill this form and we will call you back within 24 hours.
        </p>
        <iframe
          title="Mill Calc services contact form"
          src="https://docs.google.com/forms/d/e/1FAIpQLScEo_-RVj3dllkoQipJxv2v6dQnlJ8lFqpNjbopH4O8udzTMA/viewform?embedded=true"
          width="100%"
          height="520"
          frameBorder="0"
          marginHeight="0"
          marginWidth="0"
          style={{ display: 'block', borderRadius: '8px', marginTop: '12px' }}
        />
      </div>
    </div>
  );
}

export default ServicesTab;
