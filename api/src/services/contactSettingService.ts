// ============================================================
// このファイルの責務：お問い合わせ機能ON/OFF設定のDB操作のみ
// コントローラー層（HTTPリクエスト処理）はcontactSettingController.tsに委譲する
// ============================================================

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const contactSettingService = {
  /**
   * お問い合わせ機能のON/OFF設定を取得する
   * データが1件も無い場合（初回起動時など）は、デフォルトで受付中(true)の設定を新規作成して返す
   */
  async getSetting() {
    const existing = await prisma.contactSetting.findFirst();

    if (existing) {
      return existing;
    }

    // 初回アクセス時：まだ設定行が1件も無いので、デフォルト値で作成する
    return prisma.contactSetting.create({
      data: { isEnabled: true },
    });
  },

  /**
   * お問い合わせ機能のON/OFF設定を更新する
   * 常に1行だけを更新する想定のため、既存の設定を探して上書きする（無ければ新規作成）
   */
  async updateSetting(isEnabled: boolean) {
    const existing = await prisma.contactSetting.findFirst();

    if (existing) {
      return prisma.contactSetting.update({
        where: { id: existing.id },
        data: { isEnabled },
      });
    }

    return prisma.contactSetting.create({
      data: { isEnabled },
    });
  },
};