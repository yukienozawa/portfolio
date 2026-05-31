// ============================================================
// このファイルの責務：実績データの取得と状態管理のみ
// UIの表示は一切行わない（WorksPage コンポーネントに完全委譲）
// API通信・fetch・useState・useEffect はこのファイルに書く
// ============================================================
 
"use client";
 
import { useState, useEffect } from "react";
 
// ============================================================
// 型定義
// ============================================================
 
export interface Achievement {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
}
 
// ============================================================
// カスタムフック
// ============================================================
 
/**
 * 実績データを取得するカスタムフック
 * 責務：APIとの通信・状態管理のみ（UIは持たない）
 *
 * 使い方：
 *   const { achievements, isLoading, isError } = useWorks();
 */
export function useWorks() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
 
  useEffect(() => {
    // useEffect 内の非同期処理は内部で async 関数を定義して呼び出す
    const fetchPublicAchievements = async () => {
      try {
        const res = await fetch("/api/achievements");
 
        if (!res.ok) throw new Error("実績データの取得に失敗しました。");
 
        const data: Achievement[] = await res.json();
        // 取得したデータで state を更新（画面が自動的に再描画される）
        setAchievements(data);
      } catch (error) {
        // API 取得失敗時はエラーフラグを立てる
        console.error("実績データ取得エラー:", error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };
 
    fetchPublicAchievements();
  }, []); // [] = マウント時（画面表示時）に1回だけ実行
 
  // achievements・isLoading・isError を返す（UIはこれらを受け取って表示するだけ）
  return { achievements, isLoading, isError };
}
 