import {
  defaultInvitationDraft,
  type GuestbookEntry,
  type InvitationRecord,
  type RsvpEntry
} from "@/lib/invitation-payload";

export const demoInvitation: InvitationRecord = {
  id: "demo-invitation",
  slug: "kim-lee-demo",
  title: "김 & 이 결혼식 초대장",
  category: "wedding",
  templateId: "wedding-classic",
  status: "published",
  payload: {
    ...defaultInvitationDraft,
    title: "김 & 이 결혼식 초대장",
    groomName: "김민준",
    brideName: "이수아",
    message: "저희 두 사람이 같은 방향을 바라보며 걷기 시작합니다. 함께 축복해 주세요."
  },
  createdAt: new Date("2026-03-01T09:00:00.000Z").toISOString(),
  publishedAt: new Date("2026-03-02T09:00:00.000Z").toISOString()
};

export const demoDashboardInvitations: InvitationRecord[] = [
  demoInvitation,
  {
    ...demoInvitation,
    id: "demo-draft",
    slug: "demo-draft",
    title: "돌잔치 초안",
    templateId: "dol-cute",
    category: "dol",
    status: "draft",
    publishedAt: null,
    payload: {
      ...defaultInvitationDraft,
      category: "dol",
      templateId: "dol-cute",
      title: "첫돌 초대장",
      groomName: "",
      brideName: "",
      message: "소중한 첫 생일을 함께 축하해 주세요."
    }
  }
];

export const demoRsvps: RsvpEntry[] = [
  {
    id: "demo-rsvp-1",
    guestName: "박하객",
    guestPhone: "010-0000-0001",
    attending: true,
    guests: 2,
    side: "groom",
    mealPreference: "yes",
    shuttleNeeded: true,
    companionNames: "이하객",
    memo: "축하드려요!",
    createdAt: new Date("2026-03-04T04:00:00.000Z").toISOString()
  }
];

export const demoGuestbookEntries: GuestbookEntry[] = [
  {
    id: "demo-gb-1",
    nickname: "친구1",
    message: "두 분의 시작을 진심으로 축하합니다.",
    approved: true,
    createdAt: new Date("2026-03-05T06:30:00.000Z").toISOString()
  }
];

export function findDemoInvitationBySlug(slug: string) {
  return demoDashboardInvitations.find((item) => item.slug === slug) ?? null;
}
