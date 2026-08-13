import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { TeamMember } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateVCard(member: TeamMember): string {
  const vcard = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:;${member.name};;;`,
    `FN:${member.name}`,
    `TITLE:${member.role}`,
    member.phone ? `TEL;TYPE=CELL:${member.phone}` : '',
    member.email ? `EMAIL;TYPE=WORK,INTERNET:${member.email}` : '',
    member.linkedin ? `URL;type=pref:${member.linkedin}` : '',
    'END:VCARD'
  ].filter(Boolean).join('\n');
  return vcard;
}

export function downloadVCard(member: TeamMember) {
  const vcard = generateVCard(member);
  const blob = new Blob([vcard], { type: 'text/vcard' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${member.name.replace(/\s+/g, '_')}.vcf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
