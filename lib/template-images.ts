export type TemplateImageSet = {
  topDecor?: string;
  bottomDecor?: string;
  divider?: string;
  background?: string;
  frame?: string;
};

const BASE = "/images/genspark";

export const templateImageMap: Record<string, TemplateImageSet> = {
  wedding: {
    topDecor: `${BASE}/cncrue0H.jpg`,
    bottomDecor: `${BASE}/AnUWYruW.jpg`,
    frame: `${BASE}/V0JrpVLM.jpg`,
    divider: `${BASE}/mFWM3tfr.jpg`,
    background: `${BASE}/TWE0rC56.jpg`
  },
  dol: {
    topDecor: `${BASE}/qUefKi23.jpg`,
    frame: `${BASE}/ZoGKweAG.jpg`,
    divider: `${BASE}/zIB8bEWC.jpg`,
    background: `${BASE}/0pnjuJfU.jpg`
  },
  hwangap: {
    topDecor: `${BASE}/2EzRs867.jpg`,
    frame: `${BASE}/2SF0Xq81.jpg`,
    divider: `${BASE}/2Sg8mqGB.jpg`,
    background: `${BASE}/3hbAfsvO.jpg`
  },
  birthday: {
    topDecor: `${BASE}/5YnWl8f5.jpg`,
    divider: `${BASE}/68eF2xjM.jpg`,
    frame: `${BASE}/6XcxVcVH.jpg`
  },
  housewarming: {
    topDecor: `${BASE}/78rOyfxL.jpg`,
    frame: `${BASE}/7W1rqztu.jpg`
  },
  baby: {
    topDecor: `${BASE}/AZJKCYaG.jpg`,
    frame: `${BASE}/DJVxKvNl.jpg`,
    background: `${BASE}/EFRNlJ6k.jpg`
  },
  graduation: {
    topDecor: `${BASE}/EJf1yoDr.jpg`,
    frame: `${BASE}/FeLszYGF.jpg`,
    divider: `${BASE}/IWM0Xjom.jpg`
  },
  business: {
    topDecor: `${BASE}/J2t3Q3VC.jpg`,
    frame: `${BASE}/JpRqNMCV.jpg`,
    divider: `${BASE}/KIvCzl5p.jpg`
  },
  bridal: {
    topDecor: `${BASE}/LGIpWzz2.jpg`,
    frame: `${BASE}/LK8lbdMR.jpg`,
    background: `${BASE}/MknR5cmp.jpg`,
    divider: `${BASE}/NzMVud0H.jpg`
  }
};

export function getTemplateImages(category: string): TemplateImageSet {
  return templateImageMap[category] ?? {};
}
