// ============================================================
// このファイルの責務：プロフィールデータの取得と状態管理
// UIの表示は一切行わない（ProfilePage コンポーネントに完全委譲）
// API通信・fetch・useState・useEffect はこのファイルに書く
// ============================================================

"use client";
 
import { useState, useEffect } from "react";
 
// ============================================================
// 型定義
// ============================================================
 
// 一般公開用プロフィールの型定義
export interface PublicProfile {
  name: string;
  bio: string;
  avatarUrl: string;
  githubUrl: string;
}
 
// ============================================================
// デフォルト値
// ============================================================
 
// API取得が遅くても違和感がないようにデフォルト値をセット
const DEFAULT_PROFILE: PublicProfile = {
  name: "Yukie Nozawa",
  bio: "約24年間、全店舗の景品（商品）部門の統括として、業務改善に携わってきました。2026年7月にブートキャンプを修了し、前職の経験とIT知見を活かせる仕事を目指しています。",
  avatarUrl: "",
  githubUrl: "",
};
 
// ============================================================
// カスタムフック
// ============================================================
 
/**
 * プロフィールデータを取得するカスタムフック
 * 責務：APIとの通信・状態管理のみ（UIは持たない）
 *
 * 使い方：
 *   const { profile, isLoading, isError } = useProfile();
 */
export function useProfile() {
  const [profile, setProfile] = useState<PublicProfile>(DEFAULT_PROFILE);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
 
  useEffect(() => {
    // useEffect 内の非同期処理は内部で async 関数を定義して呼び出す
    const fetchPublicProfile = async () => {
      try {
        const res = await fetch("/api/profile/public");
 
        if (!res.ok) throw new Error("プロフィールの取得に失敗しました。");
 
        const data: PublicProfile = await res.json();
 
        // 取得したデータで state を更新（画面が自動的に再描画される）
        setProfile({
          name: data.name,
          bio: data.bio,
          avatarUrl: data.avatarUrl || "",
          githubUrl: data.githubUrl || "",
        });
      } catch (error) {
        // API 取得失敗時はデフォルト値のまま表示を維持し、エラーフラグを立てる
        console.error("プロフィール取得エラー:", error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };
 
    fetchPublicProfile();
  }, []); // [] = マウント時（画面表示時）に1回だけ実行
 
  // profile・isLoading・isError を返す（UIはこれらを受け取って表示するだけ）
  return { profile, isLoading, isError };
}
 