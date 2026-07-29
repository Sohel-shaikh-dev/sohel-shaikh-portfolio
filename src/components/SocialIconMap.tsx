import { 
  FaInstagram, FaLinkedin, FaGithub, FaYoutube, FaFacebook, FaXTwitter, 
  FaDiscord, FaTelegram, FaWhatsapp, FaBehance, FaDribbble, FaMedium, 
  FaDev, FaKaggle, FaStackOverflow, FaReddit, FaPinterest, FaTiktok, 
  FaSnapchat, FaTwitch, FaProductHunt, FaCodepen, FaHashnode, FaGitlab, 
  FaBitbucket, FaGlobe, FaEnvelope
} from 'react-icons/fa6'
import { SiCodesandbox, SiLeetcode, SiHackerrank, SiThreads } from 'react-icons/si'
import React from 'react'

export const PLATFORMS = [
  { key: 'instagram', name: 'Instagram', iconName: 'FaInstagram' },
  { key: 'linkedin', name: 'LinkedIn', iconName: 'FaLinkedin' },
  { key: 'github', name: 'GitHub', iconName: 'FaGithub' },
  { key: 'youtube', name: 'YouTube', iconName: 'FaYoutube' },
  { key: 'facebook', name: 'Facebook', iconName: 'FaFacebook' },
  { key: 'twitter', name: 'Twitter / X', iconName: 'FaXTwitter' },
  { key: 'threads', name: 'Threads', iconName: 'SiThreads' },
  { key: 'discord', name: 'Discord', iconName: 'FaDiscord' },
  { key: 'telegram', name: 'Telegram', iconName: 'FaTelegram' },
  { key: 'whatsapp', name: 'WhatsApp', iconName: 'FaWhatsapp' },
  { key: 'behance', name: 'Behance', iconName: 'FaBehance' },
  { key: 'dribbble', name: 'Dribbble', iconName: 'FaDribbble' },
  { key: 'medium', name: 'Medium', iconName: 'FaMedium' },
  { key: 'devto', name: 'Dev.to', iconName: 'FaDev' },
  { key: 'kaggle', name: 'Kaggle', iconName: 'FaKaggle' },
  { key: 'stackoverflow', name: 'Stack Overflow', iconName: 'FaStackOverflow' },
  { key: 'reddit', name: 'Reddit', iconName: 'FaReddit' },
  { key: 'pinterest', name: 'Pinterest', iconName: 'FaPinterest' },
  { key: 'tiktok', name: 'TikTok', iconName: 'FaTiktok' },
  { key: 'snapchat', name: 'Snapchat', iconName: 'FaSnapchat' },
  { key: 'twitch', name: 'Twitch', iconName: 'FaTwitch' },
  { key: 'producthunt', name: 'Product Hunt', iconName: 'FaProductHunt' },
  { key: 'codepen', name: 'CodePen', iconName: 'FaCodepen' },
  { key: 'codesandbox', name: 'CodeSandbox', iconName: 'SiCodesandbox' },
  { key: 'hashnode', name: 'Hashnode', iconName: 'FaHashnode' },
  { key: 'leetcode', name: 'LeetCode', iconName: 'SiLeetcode' },
  { key: 'hackerrank', name: 'HackerRank', iconName: 'SiHackerrank' },
  { key: 'gitlab', name: 'GitLab', iconName: 'FaGitlab' },
  { key: 'bitbucket', name: 'Bitbucket', iconName: 'FaBitbucket' },
  { key: 'website', name: 'Website', iconName: 'FaGlobe' },
  { key: 'email', name: 'Email', iconName: 'FaEnvelope' }
]

export const iconMap: Record<string, React.ElementType> = {
  FaInstagram, FaLinkedin, FaGithub, FaYoutube, FaFacebook, FaXTwitter,
  FaDiscord, FaTelegram, FaWhatsapp, FaBehance, FaDribbble, FaMedium,
  FaDev, FaKaggle, FaStackOverflow, FaReddit, FaPinterest, FaTiktok,
  FaSnapchat, FaTwitch, FaProductHunt, FaCodepen, FaHashnode, FaGitlab,
  FaBitbucket, FaGlobe, FaEnvelope,
  SiCodesandbox, SiLeetcode, SiHackerrank, SiThreads
}

export const AVAILABLE_ICONS = Object.keys(iconMap)

export function SocialIcon({ iconName, className = '', size = 20 }: { iconName: string, className?: string, size?: number }) {
  const IconComponent = iconMap[iconName] || FaGlobe
  return <IconComponent className={className} size={size} />
}

export function getPlatformColors(platformKey: string) {
  const colors: Record<string, string> = {
    instagram: 'border-pink-500/40 text-pink-500 hover:bg-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.15)]',
    linkedin: 'border-blue-500/40 text-blue-500 hover:bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.15)]',
    github: 'border-white/30 text-white hover:bg-white hover:text-black shadow-[0_0_10px_rgba(255,255,255,0.1)]',
    youtube: 'border-red-500/40 text-red-500 hover:bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.15)]',
    facebook: 'border-blue-600/40 text-blue-600 hover:bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.15)]',
    twitter: 'border-gray-400/40 text-gray-400 hover:bg-gray-400 hover:text-black shadow-[0_0_10px_rgba(156,163,175,0.15)]',
    whatsapp: 'border-green-500/40 text-green-500 hover:bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.15)]',
    email: 'border-orange-500/40 text-orange-500 hover:bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.15)]',
    website: 'border-primary/40 text-primary hover:bg-primary shadow-[0_0_10px_rgba(255,1,79,0.15)]',
  }
  
  // Default fallback style
  return colors[platformKey] || 'border-gray-500/40 text-gray-400 hover:bg-gray-500 hover:text-white shadow-[0_0_10px_rgba(107,114,128,0.15)]'
}
