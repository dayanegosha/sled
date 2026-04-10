"use client";

import Link from 'next/link';
import { useTranslation } from 'react-i18next';

const content = {
  ru: {
    title: 'Политика конфиденциальности След',
    date: 'Дата вступления в силу: 09.04.2026',
    back: 'Назад',
    sections: [
      { heading: '1. Какие данные мы обрабатываем', body: null, items: [
        'идентификаторы аккаунта VK ID и базовые профильные данные;',
        'геолокационные точки и агрегированная статистика перемещений;',
        'контент сообщества (посты, комментарии, реакции);',
        'технические данные сессии и безопасности (cookies, IP, device_id и пр.).',
      ]},
      { heading: '2. Цели обработки', body: 'Данные используются для авторизации через VK ID, предоставления функций карты и статистики, обеспечения безопасности, предотвращения злоупотреблений и улучшения пользовательского опыта.' },
      { heading: '3. Правовые основания', body: 'Обработка осуществляется на основании вашего согласия, а также в целях исполнения пользовательского соглашения и соблюдения требований применимого законодательства.' },
      { heading: '4. Передача и хранение', body: 'Мы не продаем персональные данные. Передача третьим лицам возможна только в рамках работы инфраструктуры, интеграций авторизации и при наличии законных оснований. Данные хранятся в течение срока, необходимого для целей обработки, либо пока учетная запись активна.' },
      { heading: '5. Cookies и безопасность', body: 'Для авторизации используются защищенные httpOnly cookies. Применяются организационные и технические меры защиты, включая ограничение доступа, валидацию запросов и журналирование действий администраторов.' },
      { heading: '6. Права пользователя', body: 'Вы можете запросить уточнение, обновление или удаление данных, а также отозвать согласие на обработку, если это не противоречит обязательным требованиям законодательства.' },
    ],
    contact: 'По вопросам конфиденциальности:',
    vkLink: 'Сообщество в ВК',
  },
  en: {
    title: 'Privacy Policy — Sled',
    date: 'Effective date: April 9, 2026',
    back: 'Back',
    sections: [
      { heading: '1. Data We Process', body: null, items: [
        'VK ID account identifiers and basic profile data;',
        'geolocation points and aggregated movement statistics;',
        'community content (posts, comments, reactions);',
        'technical session and security data (cookies, IP, device_id, etc.).',
      ]},
      { heading: '2. Purposes of Processing', body: 'Data is used for VK ID authorization, providing map and statistics features, ensuring security, preventing abuse, and improving user experience.' },
      { heading: '3. Legal Basis', body: 'Processing is carried out on the basis of your consent, as well as for the purposes of fulfilling the user agreement and complying with applicable legislation.' },
      { heading: '4. Transfer and Storage', body: 'We do not sell personal data. Transfer to third parties is possible only within the framework of infrastructure operations, authorization integrations, and when there are legal grounds. Data is stored for the period necessary for the purposes of processing, or as long as the account is active.' },
      { heading: '5. Cookies and Security', body: 'Secure httpOnly cookies are used for authorization. Organizational and technical protection measures are applied, including access control, request validation, and administrator action logging.' },
      { heading: '6. User Rights', body: 'You may request clarification, updating, or deletion of your data, and withdraw consent for processing, unless this contradicts mandatory legal requirements.' },
    ],
    contact: 'For privacy inquiries:',
    vkLink: 'VK Community',
  },
  zh: {
    title: '隐私政策 — След',
    date: '生效日期：2026年4月9日',
    back: '返回',
    sections: [
      { heading: '1. 我们处理的数据', body: null, items: [
        'VK ID 账户标识符和基本个人资料数据；',
        '地理位置点和汇总移动统计数据；',
        '社区内容（帖子、评论、反应）；',
        '技术会话和安全数据（cookies、IP、device_id等）。',
      ]},
      { heading: '2. 处理目的', body: '数据用于 VK ID 授权、提供地图和统计功能、确保安全、防止滥用和改善用户体验。' },
      { heading: '3. 法律依据', body: '处理基于您的同意，以及为履行用户协议和遵守适用法律的目的。' },
      { heading: '4. 传输和存储', body: '我们不出售个人数据。仅在基础设施运营、授权集成以及存在法律依据的情况下才可能将数据传输给第三方。数据在处理目的所需的期间内存储，或在账户处于活跃状态时存储。' },
      { heading: '5. Cookies 和安全', body: '授权使用安全的 httpOnly cookies。采用组织和技术保护措施，包括访问控制、请求验证和管理员操作日志。' },
      { heading: '6. 用户权利', body: '您可以请求澄清、更新或删除您的数据，并撤回处理同意，除非这与强制性法律要求相矛盾。' },
    ],
    contact: '隐私咨询：',
    vkLink: 'VK 社区',
  },
};

export default function PrivacyPage() {
  const { i18n } = useTranslation();
  const lang = (i18n.resolvedLanguage ?? 'ru') as keyof typeof content;
  const c = content[lang] ?? content.ru;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 text-white">
      <Link href="/login" className="mb-4 inline-flex items-center gap-1.5 text-sm text-white/50 transition hover:text-white/80">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4"><path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" /></svg>
        {c.back}
      </Link>
      <article className="rounded-3xl border border-white/10 bg-[#111420]/70 p-6 shadow-2xl backdrop-blur-xl">
        <h1 className="text-3xl font-bold tracking-tight">{c.title}</h1>
        <p className="mt-2 text-sm text-white/60">{c.date}</p>
        {c.sections.map((s: any) => (
          <section key={s.heading} className="mt-5 space-y-3 text-sm text-white/80">
            <h2 className="text-lg font-semibold text-white">{s.heading}</h2>
            {s.items ? (
              <ul className="list-disc space-y-1 pl-5">
                {s.items.map((item: string, i: number) => <li key={i}>{item}</li>)}
              </ul>
            ) : (
              <p>{s.body}</p>
            )}
          </section>
        ))}
        <section className="mt-5 space-y-3 text-sm text-white/80">
          <h2 className="text-lg font-semibold text-white">7. {lang === 'zh' ? '联系方式' : lang === 'en' ? 'Contact' : 'Контакты'}</h2>
          <p>{c.contact} <a className="text-blue-300" href="https://vk.com/club237560758" target="_blank" rel="noopener noreferrer">{c.vkLink}</a></p>
        </section>
      </article>
    </main>
  );
}
