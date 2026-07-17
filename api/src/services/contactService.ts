import { PrismaClient } from '@prisma/client';
import { mailerTransport } from '../config/mailer';

const prisma = new PrismaClient();

/**
 * HTML特殊文字をエスケープし、メール本文へのタグ injection を防ぐ
 */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export const contactService = {
  /**
   * 問い合わせ内容をデータベースに保存し、外部へ通知をトリガーする
   */
  async createInquiry(inquiryInput: {
    senderName: string;
    senderEmail: string;
    messageContent: string;
  }) {
    // 1. データベース（Inquiryテーブル）への保存
    const newInquiry = await prisma.inquiry.create({
      data: {
        name: inquiryInput.senderName,       // スキーマの name にマッピング
        email: inquiryInput.senderEmail,     // スキーマの email にマッピング
        message: inquiryInput.messageContent, // スキーマの message にマッピング
      },
    });

    // 2. 外部へのリアルタイムWebhook通知 (Slack等)
    const webhookUrl = process.env.NOTIFICATION_WEBHOOK_URL;
    if (webhookUrl) {
      try {
        // 将来的な Slack Block Kit 等の拡張を見据えたリッチな通知ペイロードの作成
        const payload = {
          text: `🔔 【NatuLife】新しいお問い合わせが届きました`,
          attachments: [
            {
              color: '#36a64f',
              fields: [
                { title: 'お名前', value: newInquiry.name, short: true },
                { title: 'メールアドレス', value: newInquiry.email, short: true },
                { title: '内容', value: newInquiry.message, short: false },
              ],
            },
          ],
        };

        // 非同期でWebhookを呼び出し（テスト環境等で落ちないようエラーハンドリングを徹底）
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } catch (webhookError) {
        // 通知の失敗によってユーザーへのレスポンスを巻き添えにしないよう、ログ出力に留める
        console.error('Webhook notification failed:', webhookError);
      }
    }

    // 3. Gmailへのメール転送通知（HTML形式）
    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
      try {
        // ユーザー入力をそのままHTMLに埋め込まないよう、事前にエスケープする
        const safeName = escapeHtml(newInquiry.name);
        const safeEmail = escapeHtml(newInquiry.email);
        const safeMessage = escapeHtml(newInquiry.message);

        const htmlBody = `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
            <div style="background-color: #36a64f; color: #ffffff; padding: 16px 20px;">
              <h2 style="margin: 0; font-size: 16px;">🔔 新しいお問い合わせが届きました</h2>
            </div>
            <div style="padding: 20px;">
              <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #334155;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; width: 100px; vertical-align: top;">お名前</td>
                  <td style="padding: 8px 0;">${safeName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; vertical-align: top;">メールアドレス</td>
                  <td style="padding: 8px 0;">${safeEmail}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; vertical-align: top;">内容</td>
                  <td style="padding: 8px 0; white-space: pre-wrap;">${safeMessage}</td>
                </tr>
              </table>
            </div>
          </div>
        `;

        await mailerTransport.sendMail({
          from: `"ポートフォリオ問い合わせ" <${process.env.GMAIL_USER}>`,
          to: process.env.GMAIL_USER,
          replyTo: newInquiry.email,
          subject: `【お問い合わせ】${newInquiry.name}様より`,
          html: htmlBody,
        });
      } catch (mailError) {
        // メール送信の失敗によってユーザーへのレスポンスを巻き添えにしないよう、ログ出力に留める
        console.error('Email forwarding failed:', mailError);
      }
    }

    return newInquiry;
  },
};