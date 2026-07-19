// ============================================================
// このファイルの責務：お問い合わせ送信のHTTPリクエスト処理のみ
// バリデーションとメンテナンス状態の確認を行い、実際のDB保存・通知処理は
// contactService.tsに完全委譲する
// ============================================================

import { Request, Response } from 'express';
import { contactService } from '../services/contactService';
import { contactSettingService } from '../services/contactSettingService';

export const contactController = {
  /**
   * POST /api/contact
   * お問い合わせの受信・送信（公開API）
   */
  async createInquiry(req: Request, res: Response) {
    try {
      // 1. お問い合わせ機能がメンテナンス中でないか確認
      const setting = await contactSettingService.getSetting();
      if (!setting.isEnabled) {
        return res.status(403).json({ error: '現在お問い合わせ機能はメンテナンス中のため、ご利用いただけません。' });
      }

      const { name, email, message } = req.body;

      // 2. バリデーションチェック（必須項目）
      if (!name || !email || !message) {
        return res.status(400).json({ error: 'すべての項目（お名前、メールアドレス、本文）を入力してください。' });
      }

      // 3. バリデーションチェック（簡単なメールアドレス形式チェック）
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'メールアドレスの形式が正しくありません。' });
      }

      // 4. サービス層へデータを渡してDB保存＆通知処理を実行
      const newInquiry = await contactService.createInquiry({
        senderName: name,
        senderEmail: email,
        messageContent: message,
      });

      // 5. 保存されたオブジェクトとともに 201 Created を返却
      return res.status(201).json(newInquiry);
    } catch (error) {
      console.error('Contact submit error:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  },
};