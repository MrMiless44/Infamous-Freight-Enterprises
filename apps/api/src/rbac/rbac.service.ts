import { Injectable, Logger } from '@nestjs/common';
import {
  UserRole,
  TeamMember,
  Permission,
  ROLE_PERMISSIONS,
  SENSITIVE_FINANCIAL_FIELDS,
  EXTERNAL_ROLES,
  SanitizedData,
  isExternalRole,
  hasPermission,
  hasAnyPermission,
  filterSensitiveFields,
  canAccessLoad,
  canSubmitTrackingUpdate,
  getMenuVisibility,
} from './rbac-rules';

// Re-export everything so existing imports continue to work.
export {
  UserRole,
  TeamMember,
  Permission,
  ROLE_PERMISSIONS,
  SENSITIVE_FINANCIAL_FIELDS,
  EXTERNAL_ROLES,
  SanitizedData,
  isExternalRole,
  hasPermission,
  hasAnyPermission,
  filterSensitiveFields,
  canAccessLoad,
  canSubmitTrackingUpdate,
  getMenuVisibility,
};

@Injectable()
export class RBACService {
  private readonly logger = new Logger(RBACService.name);
  private members: Map<string, TeamMember> = new Map();

  async inviteMember(
    carrierId: string,
    email: string,
    role: UserRole,
    invitedBy: string,
  ): Promise<TeamMember> {
    const id = `member_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const member: TeamMember = {
      id,
      email,
      name: email.split('@')[0],
      role,
      carrierId,
      invitedBy,
      status: 'pending',
      permissions: ROLE_PERMISSIONS[role],
      createdAt: new Date(),
    };

    this.members.set(id, member);
    this.logger.warn(`Invitation email not configured — ${email} invited as ${role} to carrier ${carrierId} (logged only)`);

    return member;
  }

  async acceptInvite(memberId: string, name: string): Promise<TeamMember> {
    const member = this.members.get(memberId);
    if (!member) throw new Error('Invite not found');

    member.status = 'active';
    member.name = name;
    member.lastActiveAt = new Date();

    return member;
  }

  async removeMember(memberId: string, removedBy: string): Promise<void> {
    const member = this.members.get(memberId);
    if (!member) return;

    member.status = 'inactive';
    this.logger.log(`Member ${memberId} removed by ${removedBy}`);
  }

  async updateRole(memberId: string, newRole: UserRole): Promise<TeamMember> {
    const member = this.members.get(memberId);
    if (!member) throw new Error('Member not found');

    member.role = newRole;
    member.permissions = ROLE_PERMISSIONS[newRole];

    return member;
  }

  async getTeamMembers(carrierId: string): Promise<TeamMember[]> {
    return Array.from(this.members.values())
      .filter(m => m.carrierId === carrierId && m.status !== 'inactive');
  }

  async getMember(userId: string): Promise<TeamMember | null> {
    return this.members.get(userId) || null;
  }

  hasPermission(member: TeamMember, permission: Permission): boolean {
    return hasPermission(member, permission);
  }

  hasAnyPermission(member: TeamMember, permissions: Permission[]): boolean {
    return hasAnyPermission(member, permissions);
  }

  /**
   * Returns true for external user roles (shipper, carrier, driver).
   * External users must never see financial margin, internal notes, or other
   * customers' / carriers' records.
   */
  isExternalRole(role: UserRole): boolean {
    return isExternalRole(role);
  }

  /**
   * Strip sensitive financial and internal fields from a data object before
   * returning it to an external user (shipper / carrier / driver).
   */
  filterSensitiveFields<T extends Record<string, unknown>>(data: T): SanitizedData<T> {
    return filterSensitiveFields(data);
  }

  /**
   * Returns true when an external member is allowed to access a specific load.
   * Internal roles always return true.
   */
  canAccessLoad(
    member: TeamMember,
    load: { shipperId?: string | null; carrierId?: string | null; driverName?: string | null },
  ): boolean {
    return canAccessLoad(member, load);
  }

  /**
   * Returns true when a member is allowed to submit a tracking update for the given load.
   */
  canSubmitTrackingUpdate(
    member: TeamMember,
    load: { carrierId?: string | null; driverName?: string | null },
  ): boolean {
    return canSubmitTrackingUpdate(member, load);
  }

  /** Returns a map of UI menu items to visibility flags for the given role. */
  getMenuVisibility(role: UserRole): Record<string, boolean> {
    return getMenuVisibility(role);
  }
}
