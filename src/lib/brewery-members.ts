export type BreweryMemberLike =
  | string
  | number
  | { _id?: string | number | null }
  | null
  | undefined;

export const getBreweryMemberId = (member: BreweryMemberLike): string | null => {
  if (typeof member === "string" || typeof member === "number") {
    return String(member);
  }

  if (member && typeof member === "object" && member._id !== null && member._id !== undefined) {
    return String(member._id);
  }

  return null;
};

export const getBreweryMemberIds = (members: BreweryMemberLike[] | null | undefined): string[] =>
  Array.isArray(members)
    ? members.map(getBreweryMemberId).filter((id): id is string => Boolean(id))
    : [];
