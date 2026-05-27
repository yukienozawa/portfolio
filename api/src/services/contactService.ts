import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const contactService = {
  /**
   * 問い合わせ内容をデータベースに保存し、外部へ通知をトリガーする
   */
  async createInquiry(data: {
    senderName: string;
    senderEmail: string;
    messageContent: string;
  }) {
    // 1. データベース（Inquiryテーブル）への保存
    const newInquiry = await prisma.inquiry.create({
      data: {
        name: data.senderName,       // スキーマの name にマッピング
        email: data.senderEmail,     // スキーマの email にマッピング
        message: data.messageContent, // スキーマの message にマッピング
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

    return newInquiry;
  },
};