"use client";

import Link from 'next/link';
import { useTranslation } from 'react-i18next';

const content = {
  ru: {
    title: 'Условия использования След',
    date: 'Дата вступления в силу: 09.04.2026',
    back: 'Назад',
    sections: [
      { heading: '1. Общие положения', body: 'Настоящие Условия регулируют использование веб-приложения След. Используя сервис, вы подтверждаете, что ознакомились с Условиями и принимаете их в полном объеме.' },
      { heading: '2. Регистрация и вход', body: 'Для доступа к функциональности требуется вход через VK ID. Вы несете ответственность за актуальность данных учетной записи и безопасность используемого устройства.' },
      { heading: '3. Допустимое использование', body: null, items: [
        'не публиковать незаконный, оскорбительный или вводящий в заблуждение контент;',
        'не предпринимать попыток нарушения работы сервиса;',
        'не использовать сервис для автоматизированного злоупотребления API.',
      ], prefix: 'Пользователь обязуется:' },
      { heading: '4. Геоданные и пользовательский контент', body: 'Вы сохраняете права на загружаемый контент. Предоставляя данные в След, вы даете неисключительное право на их обработку, хранение и отображение в рамках работы сервиса.' },
      { heading: '5. Ограничение ответственности', body: 'Сервис предоставляется «как есть». Мы не гарантируем бесперебойную работу в любой момент времени и не несем ответственность за убытки, вызванные невозможностью использования сервиса, если иное не предусмотрено применимым законодательством.' },
      { heading: '6. Изменение условий', body: 'Мы вправе обновлять Условия. Новая редакция вступает в силу с даты публикации на этой странице.' },
    ],
    contact: 'По вопросам использования сервиса:',
    vkLink: 'Сообщество в ВК',
  },
  en: {
    title: 'Terms of Use — Sled',
    date: 'Effective date: April 9, 2026',
    back: 'Back',
    sections: [
      { heading: '1. General Provisions', body: 'These Terms govern the use of the Sled web application. By using the service, you confirm that you have read and accept the Terms in full.' },
      { heading: '2. Registration and Login', body: 'Access to functionality requires signing in via VK ID. You are responsible for keeping your account data up to date and for the security of the device you use.' },
      { heading: '3. Acceptable Use', body: null, items: [
        'not publish illegal, offensive, or misleading content;',
        'not attempt to disrupt the service;',
        'not use the service for automated API abuse.',
      ], prefix: 'The user agrees to:' },
      { heading: '4. Geodata and User Content', body: 'You retain rights to the content you upload. By providing data to Sled, you grant a non-exclusive right to process, store, and display it within the service.' },
      { heading: '5. Limitation of Liability', body: 'The service is provided "as is." We do not guarantee uninterrupted operation at all times and are not liable for losses caused by the inability to use the service, unless otherwise provided by applicable law.' },
      { heading: '6. Changes to Terms', body: 'We reserve the right to update the Terms. The new version takes effect from the date of publication on this page.' },
    ],
    contact: 'For service usage inquiries:',
    vkLink: 'VK Community',
  },
  zh: {
    title: '使用条款 — След',
    date: '生效日期：2026年4月9日',
    back: '返回',
    sections: [
      { heading: '1. 总则', body: '本条款规定了 След 网络应用程序的使用。使用本服务即表示您已阅读并完全接受本条款。' },
      { heading: '2. 注册和登录', body: '访问功能需要通过 VK ID 登录。您有责任保持账户数据的最新状态以及所使用设备的安全。' },
      { heading: '3. 可接受的使用', body: null, items: [
        '不发布非法、冒犯性或误导性内容；',
        '不试图破坏服务的运行；',
        '不使用服务进行自动化 API 滥用。',
      ], prefix: '用户同意：' },
      { heading: '4. 地理数据和用户内容', body: '您保留上传内容的权利。通过向 След 提供数据，您授予在服务范围内处理、存储和显示该数据的非独占权利。' },
      { heading: '5. 责任限制', body: '服务按"原样"提供。我们不保证始终不间断运行，也不对因无法使用服务而造成的损失承担责任，除非适用法律另有规定。' },
      { heading: '6. 条款变更', body: '我们保留更新条款的权利。新版本自本页面发布之日起生效。' },
    ],
    contact: '服务使用咨询：',
    vkLink: 'VK 社区',
  },
};

export default function TermsPage() {
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
              <>
                {s.prefix && <p>{s.prefix}</p>}
                <ul className="list-disc space-y-1 pl-5">
                  {s.items.map((item: string, i: number) => <li key={i}>{item}</li>)}
                </ul>
              </>
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
