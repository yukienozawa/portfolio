// ============================================================
// このファイルの責務：お問い合わせ機能ON/OFF設定のDB操作のみ
// コントローラー層（HTTPリクエスト処理）はcontactSettingController.tsに委譲する
//
// ⚠️ 設計方針：常に id=1 の行のみを使用する（シングルトン的な扱い）
// findFirst + create の分岐だと、同時リクエスト時に重複行が作られる
// レースコンディションのリスクがあるため、upsertで単一操作にまとめている
// ============================================================

import { prisma } from '../lib/prisma';

// 常にこのIDの行だけを読み書きする
const SETTING_ID = 1;

export const contactSettingService = {
  /**
   * 1. お問い合わせ機能のON/OFF設定を取得する
   * データが無い場合（初回起動時など）は、upsertでデフォルト値(true)の行を作成しつつ取得する
   */
  async getSetting() {
    return prisma.contactSetting.upsert({
      where: { id: SETTING_ID },
      update: {},
      create: { id: SETTING_ID, isEnabled: true },
    });
  },

  /**
   * 2. お問い合わせ機能のON/OFF設定を更新する
   * upsertにより、行の有無を問わず単一のアトミックな操作で安全に反映する
   */
  async updateSetting(isEnabled: boolean) {
    return prisma.contactSetting.upsert({
      where: { id: SETTING_ID },
      update: { isEnabled },
      create: { id: SETTING_ID, isEnabled },
    });
  },
};