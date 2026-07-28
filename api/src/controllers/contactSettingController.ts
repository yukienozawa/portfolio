// ============================================================
// このファイルの責務：お問い合わせ機能ON/OFF設定のHTTPリクエスト処理のみ
// DB操作はcontactSettingService.tsに完全委譲する
// ============================================================

import { Request, Response } from 'express';
import { contactSettingService } from '../services/contactSettingService';

export const contactSettingController = {
  /**
   * 1. GET /api/contact-setting
   * お問い合わせ機能のON/OFF状態を取得（公開API：Contactページの表示切り替えに使用）
   */
  async getSetting(req: Request, res: Response) {
    try {
      const setting = await contactSettingService.getSetting();
      res.status(200).json({ isEnabled: setting.isEnabled });
    } catch (error) {
      console.error('Get contact setting error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  /**
   * 2. PUT /api/admin/contact-setting
   * お問い合わせ機能のON/OFFを切り替える（管理者専用）
   */
  async updateSetting(req: Request, res: Response) {
    try {
      const { isEnabled } = req.body;

      if (typeof isEnabled !== 'boolean') {
        return res.status(400).json({ error: 'isEnabled must be a boolean' });
      }

      const updated = await contactSettingService.updateSetting(isEnabled);
      res.status(200).json({ isEnabled: updated.isEnabled });
    } catch (error) {
      console.error('Update contact setting error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },
};