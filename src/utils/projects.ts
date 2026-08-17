import { getAllPosts } from './posts';

export interface Project {
  id: string;
  title: string;
  sector: string;
  status: 'ACTIVE' | 'DEPLOYED' | 'STAGING';
  tech: string;
  icon: string;
  desc: string;
  full: string;
}

export const getProjects = (): Project[] => {
  const posts = getAllPosts();
  return posts.map((post, index) => ({
    id: post.attributes.id,
    title: post.attributes.title,
    sector: post.attributes.type || `SECTOR-0${index + 1}`,
    status: 'ACTIVE', // Default status for posts
    tech: post.attributes.subtitle || 'MARKDOWN / DOCUMENT',
    icon: 'fa-file-lines', // Default icon for posts
    desc: post.attributes.excerpt || '系统作战档案记录。',
    full: post.body,
  }));
};

export const ABOUT_PROJECT: Project = {
  id: 'about',
  title: '关于本机', sector: 'SYSTEM-00', status: 'ACTIVE', tech: 'SITE / OS', icon: 'fa-circle-info',
  desc: '系统信息',
  full: '作战档案室 // PORTFOLIO v2.6 — ENDFIELD 桌面系统。\n操作者：LEEKLONG #2569 · UID 1145077480 · 创造日 2026/08/13 。'
};

export const STATUS_BADGE = {
  ACTIVE: 'bg-endfield-yellow text-endfield-dark',
  DEPLOYED: 'bg-neutral-200 dark:bg-neutral-700 text-endfield-dark',
  STAGING: 'bg-neutral-800 text-white'
};
