import type {Metadata} from "next";

const FALLBACK_ORIGIN="https://field-dx-studio.jtpgjmdaj587456325.chatgpt.site";
const cleanOrigin=(value:string)=>value.replace(/\/+$/,"");

export const SITE_ORIGIN=cleanOrigin(process.env.NEXT_PUBLIC_SITE_URL||FALLBACK_ORIGIN);
export const CANONICAL_ORIGIN=cleanOrigin(process.env.NEXT_PUBLIC_CANONICAL_URL||SITE_ORIGIN);
export const SEO_INDEXABLE=process.env.NEXT_PUBLIC_SEO_INDEXABLE!=="false";
export const canonicalUrl=(path="/")=>new URL(path,CANONICAL_ORIGIN).toString();
export const siteUrl=(path="/")=>new URL(path,SITE_ORIGIN).toString();
export const jsonLd=(value:unknown)=>JSON.stringify(value).replace(/</g,"\\u003c");

export function pageMetadata(path:string,title:string,description:string,image=true):Metadata{
 const images=image?[{url:siteUrl("/og.png?v=3"),width:1200,height:630,alt:"つなぐ開発｜つなぎ、かたちにする。"}]:[];
 return {title,description,alternates:{canonical:canonicalUrl(path)},robots:{index:SEO_INDEXABLE,follow:SEO_INDEXABLE},openGraph:{title,description,url:canonicalUrl(path),siteName:"つなぐ開発",locale:"ja_JP",type:"website",images},twitter:{card:images.length?"summary_large_image":"summary",title,description,images}};
}
