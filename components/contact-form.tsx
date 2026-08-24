"use client";

import { FormEvent, useState } from "react";
import { getOrCreateVisitorId } from "@/lib/visitor-id";

type FormState = "idle" | "sending" | "success" | "error";

export function ContactForm() {
  const [state, setState] = useState<FormState>("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("sending");
    setMessage("");

    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = Object.fromEntries(data.entries());

    try {
      const response = await fetch("/api/consultations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, visitorId: getOrCreateVisitorId() }),
      });
      const result = (await response.json()) as { error?: string; reference?: string };
      if (!response.ok) throw new Error(result.error ?? "送信できませんでした。");

      form.reset();
      setState("success");
      setMessage(`相談内容を保存しました。受付番号：${result.reference ?? "受付済み"}`);
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "送信できませんでした。");
    }
  }

  return (
    <form className="contact-form" onSubmit={submit}>
      <div className="contact-form-heading">
        <span>CONSULTATION FORM</span>
        <p>内容は管理画面に保存されます。送信後、確認でき次第ご連絡します。</p>
      </div>
      <div className="form-grid">
        <label><span>会社・屋号</span><input name="companyName" autoComplete="organization" placeholder="任意" /></label>
        <label><span>お名前 *</span><input name="contactName" autoComplete="name" required /></label>
        <label><span>メールアドレス *</span><input name="email" type="email" autoComplete="email" required /></label>
        <label><span>電話番号</span><input name="phone" type="tel" autoComplete="tel" placeholder="任意" /></label>
        <label className="form-wide">
          <span>相談したい内容 *</span>
          <select name="interest" required defaultValue="">
            <option value="" disabled>選択してください</option>
            <option>受付・問い合わせDX</option>
            <option>業務システム・管理画面</option>
            <option>既存システム連携・自動化</option>
            <option>SEO・アクセス分析・Web改善</option>
            <option>まだ整理できていない</option>
          </select>
        </label>
        <label className="form-wide"><span>現在の困りごと *</span><textarea name="message" rows={6} minLength={10} required placeholder="現在の流れや、手間になっていることを分かる範囲でご記入ください。" /></label>
        <label className="form-trap" aria-hidden="true"><span>Webサイト</span><input name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>
      <label className="consent-line"><input type="checkbox" required /><span>入力内容を相談対応のために保存することに同意します。</span></label>
      <button className="contact-submit" type="submit" disabled={state === "sending"}>
        {state === "sending" ? "保存しています…" : "相談内容を送信する"}<span aria-hidden="true">↗</span>
      </button>
      <p className="analytics-note">
        アクセス分析にはブラウザ内の匿名ID・閲覧箇所・流入元・国・端末／ブラウザ種別を使用します。IPアドレスや端末指紋は保存しません。
      </p>
      {message && <p className={`form-message ${state}`} role="status">{message}</p>}
    </form>
  );
}
