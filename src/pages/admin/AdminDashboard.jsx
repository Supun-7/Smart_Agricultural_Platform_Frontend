import { useState, useCallback, useEffect, useMemo } from "react";
import { useAdminDashboard } from "../../hooks/useAdminDashboard.js";
import { useAuth } from "../../hooks/useAuth.js";
import { adminApi } from "../../services/api.js";
import { StatCard } from "../../components/investor/StatCard.jsx";
import AnalyticsSection from "../../components/admin/AnalyticsSection.jsx";
import "../../styles/pages/admin/dashboard.css";

function fmt(val) {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 2,
  }).format(Number(val ?? 0));
}

function fmtDateTime(value) {
  if (!value) return "—";
  try {
    return new Intl.DateTimeFormat("en-LK", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function StatusBadge({ status }) {
  const map = {
    VERIFIED: "adminBadgeVerified",
    PENDING: "adminBadgePending",
    REJECTED: "adminBadgeRejected",
    NOT_SUBMITTED: "adminBadgeMuted",
  };

  return (
    <span className={"adminBadge " + (map[status] ?? "adminBadgeMuted")}>
      {status?.replaceAll("_", " ") ?? "—"}
    </span>
  );
}

function AccountStatusBadge({ status }) {
  const cls =
    status === "SUSPENDED" ? "adminBadgeSuspended" : "adminBadgeActive";

  return <span className={"adminBadge " + cls}>{status ?? "ACTIVE"}</span>;
}

function AccountActionButton({
  user,
  token,
  onStatusChange,
  currentUserId,
  currentUserRole,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const uid = user.userId ?? user.id;
  const targetRole = user.role;
  const isSuspended = user.accountStatus === "SUSPENDED";
  const isSelf =
    currentUserId !== undefined &&
    currentUserId !== null &&
    String(uid) === String(currentUserId);

  const targetIsAdmin = targetRole === "ADMIN";
  const targetIsSystemAdmin = targetRole === "SYSTEM_ADMIN";
  const actorIsSystemAdmin = currentUserRole === "SYSTEM_ADMIN";

  const lockedByRole =
    targetIsSystemAdmin || (targetIsAdmin && !actorIsSystemAdmin);

  const disabled = loading || isSelf || lockedByRole;

  async function handleClick() {
    if (disabled) return;

    setLoading(true);
    setError("");

    try {
      if (isSuspended) {
        await adminApi.activateUser(token, uid);
      } else {
        await adminApi.suspendUser(token, uid);
      }

      onStatusChange(
        uid,
        isSuspended ? "ACTIVE" : "SUSPENDED",
        isSuspended ? "ACTIVATE_USER" : "SUSPEND_USER"
      );
    } catch (err) {
      setError(err?.message || "Action failed");
    } finally {
      setLoading(false);
    }
  }

  let buttonClass = "adminActionBtn ";
  buttonClass += isSuspended
    ? "adminActionBtnActivate"
    : "adminActionBtnSuspend";

  if (disabled) {
    buttonClass += " adminActionBtnDisabled";
  }

  let buttonText = isSuspended ? "Activate" : "Suspend";

  if (loading) {
    buttonText = isSuspended ? "Activating..." : "Suspending...";
  } else if (isSelf) {
    buttonText = "Your Account";
  } else if (targetIsSystemAdmin) {
    buttonText = "System Admin Locked";
  } else if (targetIsAdmin && !actorIsSystemAdmin) {
    buttonText = "Admin Locked";
  }

  let buttonTitle = "";
  if (isSelf) {
    buttonTitle = "You cannot change your own account status";
  } else if (targetIsSystemAdmin) {
    buttonTitle = "System admin accounts cannot be changed here";
  } else if (targetIsAdmin && !actorIsSystemAdmin) {
    buttonTitle = "Only system admin can manage admin accounts";
  }

  return (
    <div className="adminActionCell">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        className={buttonClass}
        title={buttonTitle}
      >
        {loading && <span className="adminActionSpinner" aria-hidden="true" />}
        <span>{buttonText}</span>
      </button>

      {error && <p className="adminActionError">{error}</p>}
    </div>
  );
}

function AuditLogsTable({ logs = [] }) {
  if (!logs.length) {
    return (
      <div className="adminEmpty">
        <span>📝</span>
        <p>No audit logs found.</p>
      </div>
    );
  }

  return (
    <div className="adminTableWrap">
      <div className="adminTableScroll">
        <table className="adminTable">
          <thead>
            <tr>
              <th>ID</th>
              <th>Action</th>
              <th>Admin</th>
              <th>Target User</th>
              <th>Details</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td className="adminTdMuted">#{log.id}</td>
                <td>{log.actionType ?? "—"}</td>
                <td className="adminTdMuted">#{log.adminUserId ?? "—"}</td>
                <td className="adminTdMuted">#{log.targetUserId ?? "—"}</td>
                <td className="adminTdMuted">{log.details ?? "—"}</td>
                <td className="adminTdMuted">{fmtDateTime(log.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function UserTable({
  users = [],
  searchPlaceholder,
  emptyEmoji,
  token,
  onStatusChange,
  onBulkStatusChange,
  currentUserId,
  currentUserRole,
}) {
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkError, setBulkError] = useState("");

  const normalizedQuery = query.trim().toLowerCase();
  const pageSize = 8;

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const name = u.name?.toLowerCase() ?? "";
      const email = u.email?.toLowerCase() ?? "";
      const role = u.role ?? "";

      const matchesQuery =
        normalizedQuery === "" ||
        name.includes(normalizedQuery) ||
        email.includes(normalizedQuery);

      const matchesRole = roleFilter === "ALL" || role === roleFilter;

      return matchesQuery && matchesRole;
    });
  }, [users, normalizedQuery, roleFilter]);

  useEffect(() => {
    setPage(1);
  }, [query, roleFilter, users]);

  useEffect(() => {
    setSelectedIds((prev) =>
      prev.filter((id) =>
        users.some((u) => String(u.userId ?? u.id) === String(id))
      )
    );
  }, [users]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginatedUsers = filtered.slice((page - 1) * pageSize, page * pageSize);

  const currentPageIds = paginatedUsers
    .filter((u) => {
      const uid = u.userId ?? u.id;
      const targetRole = u.role;
      const isSelf = String(uid) === String(currentUserId);
      const targetIsAdmin = targetRole === "ADMIN";
      const targetIsSystemAdmin = targetRole === "SYSTEM_ADMIN";
      const actorIsSystemAdmin = currentUserRole === "SYSTEM_ADMIN";

      if (isSelf) return false;
      if (targetIsSystemAdmin) return false;
      if (targetIsAdmin && !actorIsSystemAdmin) return false;
      return true;
    })
    .map((u) => u.userId ?? u.id);

  const allCurrentPageSelected =
    currentPageIds.length > 0 &&
    currentPageIds.every((id) => selectedIds.includes(id));

  function toggleUser(userId) {
    setSelectedIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  }

  function toggleSelectAll() {
    if (allCurrentPageSelected) {
      setSelectedIds((prev) =>
        prev.filter((id) => !currentPageIds.includes(id))
      );
    } else {
      setSelectedIds((prev) => [...new Set([...prev, ...currentPageIds])]);
    }
  }

  async function handleBulkSuspend() {
    if (!selectedIds.length || bulkLoading) return;

    setBulkLoading(true);
    setBulkError("");

    try {
      if (typeof adminApi.bulkSuspendUsers === "function") {
        await adminApi.bulkSuspendUsers(token, selectedIds);
      } else {
        await Promise.all(
          selectedIds.map((id) => adminApi.suspendUser(token, id))
        );
      }

      onBulkStatusChange(selectedIds, "SUSPENDED", "BULK_SUSPEND_USER");
      setSelectedIds([]);
    } catch (err) {
      setBulkError(err?.message || "Bulk suspend failed");
    } finally {
      setBulkLoading(false);
    }
  }

  async function handleBulkActivate() {
    if (!selectedIds.length || bulkLoading) return;

    setBulkLoading(true);
    setBulkError("");

    try {
      if (typeof adminApi.bulkActivateUsers === "function") {
        await adminApi.bulkActivateUsers(token, selectedIds);
      } else {
        await Promise.all(
          selectedIds.map((id) => adminApi.activateUser(token, id))
        );
      }

      onBulkStatusChange(selectedIds, "ACTIVE", "BULK_ACTIVATE_USER");
      setSelectedIds([]);
    } catch (err) {
      setBulkError(err?.message || "Bulk activate failed");
    } finally {
      setBulkLoading(false);
    }
  }

  return (
    <div className="adminTableWrap">
      <div className="adminTableTop">
        <div className="adminTableControls">
          <select
            className="input adminTableFilter"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="ALL">All Roles</option>
            <option value="FARMER">Farmer</option>
            <option value="INVESTOR">Investor</option>
            <option value="AUDITOR">Auditor</option>
            <option value="ADMIN">Admin</option>
            <option value="SYSTEM_ADMIN">System Admin</option>
          </select>

          <input
            className="input adminTableSearch"
            placeholder={searchPlaceholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="adminBulkBar">
        <div className="adminBulkActions">
          <button
            type="button"
            className="adminBulkBtn adminBulkBtnDanger"
            onClick={handleBulkSuspend}
            disabled={!selectedIds.length || bulkLoading}
          >
            {bulkLoading ? "Processing..." : "Suspend Selected"}
          </button>

          <button
            type="button"
            className="adminBulkBtn adminBulkBtnSuccess"
            onClick={handleBulkActivate}
            disabled={!selectedIds.length || bulkLoading}
          >
            {bulkLoading ? "Processing..." : "Activate Selected"}
          </button>
        </div>

        <span className="adminPageInfo">{selectedIds.length} selected</span>
      </div>

      {bulkError && <p className="adminActionError">{bulkError}</p>}

      {filtered.length === 0 ? (
        <div className="adminEmpty">
          <span>{emptyEmoji}</span>
          <p>No records found.</p>
        </div>
      ) : (
        <>
          <div className="adminTableScroll">
            <table className="adminTable">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={allCurrentPageSelected}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Verification</th>
                  <th>Account Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {paginatedUsers.map((u) => (
                  <tr key={u.userId ?? u.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(u.userId ?? u.id)}
                        onChange={() => toggleUser(u.userId ?? u.id)}
                        disabled={!currentPageIds.includes(u.userId ?? u.id)}
                      />
                    </td>
                    <td className="adminTdMuted">#{u.userId ?? u.id}</td>
                    <td className="adminTdName">{u.name}</td>
                    <td className="adminTdMuted">{u.email}</td>
                    <td>{u.role}</td>
                    <td>
                      <StatusBadge status={u.status} />
                    </td>
                    <td>
                      <AccountStatusBadge status={u.accountStatus} />
                    </td>
                    <td>
                      <AccountActionButton
                        user={u}
                        token={token}
                        onStatusChange={onStatusChange}
                        currentUserId={currentUserId}
                        currentUserRole={currentUserRole}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="adminPagination">
            <button
              type="button"
              className="adminPageBtn"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </button>

            <span className="adminPageInfo">
              Page {page} of {totalPages}
            </span>

            <button
              type="button"
              className="adminPageBtn"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const { dashboard, loading, error, reload } = useAdminDashboard();
  const { token, user, currentUser } = useAuth();

  const [localDashboard, setLocalDashboard] = useState(null);
  const [manualRefreshing, setManualRefreshing] = useState(false);

  const authUser = user ?? currentUser ?? null;
  const currentUserId = authUser?.userId ?? authUser?.id ?? null;
  const currentUserRole = authUser?.role ?? null;

  useEffect(() => {
    if (dashboard) {
      setLocalDashboard(dashboard);
    }
  }, [dashboard]);

  const handleStatusChange = useCallback(
    (userId, newStatus, actionLabel = null) => {
      setLocalDashboard((prev) => {
        if (!prev) return prev;

        const updateUsers = (users = []) =>
          users.map((u) =>
            String(u.userId ?? u.id) === String(userId)
              ? { ...u, accountStatus: newStatus }
              : u
          );

        const tempLog = actionLabel
          ? {
            id: `temp-${Date.now()}-${userId}`,
            actionType: actionLabel,
            adminUserId: currentUserId,
            targetUserId: userId,
            details: `Account status changed to ${newStatus}`,
            createdAt: new Date().toISOString(),
          }
          : null;

        return {
          ...prev,
          farmers: updateUsers(prev.farmers ?? []),
          investors: updateUsers(prev.investors ?? []),
          auditors: updateUsers(prev.auditors ?? []),
          admins: updateUsers(prev.admins ?? []),
          systemAdmins: updateUsers(prev.systemAdmins ?? []),
          auditLogs: tempLog
            ? [tempLog, ...(prev.auditLogs ?? [])]
            : prev.auditLogs ?? [],
        };
      });
    },
    [currentUserId]
  );

  const handleBulkStatusChange = useCallback(
    (userIds, newStatus, actionLabel = null) => {
      setLocalDashboard((prev) => {
        if (!prev) return prev;

        const idSet = new Set(userIds.map(String));

        const updateUsers = (users = []) =>
          users.map((u) =>
            idSet.has(String(u.userId ?? u.id))
              ? { ...u, accountStatus: newStatus }
              : u
          );

        const tempLogs = actionLabel
          ? userIds.map((userId, index) => ({
            id: `temp-${Date.now()}-${userId}-${index}`,
            actionType: actionLabel,
            adminUserId: currentUserId,
            targetUserId: userId,
            details: `Account status changed to ${newStatus}`,
            createdAt: new Date().toISOString(),
          }))
          : [];

        return {
          ...prev,
          farmers: updateUsers(prev.farmers ?? []),
          investors: updateUsers(prev.investors ?? []),
          auditors: updateUsers(prev.auditors ?? []),
          admins: updateUsers(prev.admins ?? []),
          systemAdmins: updateUsers(prev.systemAdmins ?? []),
          auditLogs: [...tempLogs, ...(prev.auditLogs ?? [])],
        };
      });
    },
    [currentUserId]
  );

  const handleManualRefresh = useCallback(async () => {
    setManualRefreshing(true);
    try {
      await reload();
    } finally {
      setManualRefreshing(false);
    }
  }, [reload]);

  const allUsers = useMemo(() => {
    const farmers = localDashboard?.farmers ?? [];
    const investors = localDashboard?.investors ?? [];
    const auditors = localDashboard?.auditors ?? [];
    const admins = localDashboard?.admins ?? [];
    const systemAdmins = localDashboard?.systemAdmins ?? [];
    return [...farmers, ...investors, ...auditors, ...admins, ...systemAdmins];
  }, [localDashboard]);

  return (
    <div className="adminPage">
      <div className="adminPageHeader">
        <div>
          <span className="adminPageEyebrow">Admin Dashboard</span>
          <h1 className="adminPageTitle">Platform Overview</h1>
          <p className="adminPageSub">
            Live data across all registered users
          </p>
        </div>

        <button
          type="button"
          className="adminRefreshBtn"
          onClick={handleManualRefresh}
          disabled={manualRefreshing}
        >
          {manualRefreshing ? "Refreshing..." : "Refresh Data"}
        </button>
      </div>

      {loading && !localDashboard && (
        <div className="adminLoading">
          <div className="adminSpin" />
          <p>Loading dashboard…</p>
        </div>
      )}

      {error && !loading && !localDashboard && (
        <div className="adminError">
          <span>⚠️</span>
          <p>{error}</p>
          <button className="btn" onClick={handleManualRefresh}>
            Retry
          </button>
        </div>
      )}

      {localDashboard && (
        <>
          <div className="adminStatGrid">
            <StatCard
              icon="🌾"
              label="Registered Farmers"
              value={localDashboard.totalFarmers}
            />
            <StatCard
              icon="💼"
              label="Registered Investors"
              value={localDashboard.totalInvestors}
              accent
            />
            <StatCard
              icon="💰"
              label="Total Investment"
              value={fmt(localDashboard.totalInvestment)}
              accent
            />
          </div>

          {/* AC-1: Analytics section — live data from /api/admin/analytics */}
          <div className="adminSection">
            <AnalyticsSection />
          </div>

          <div className="adminSection">
            <h2 className="adminSectionTitle">All Users</h2>
            <UserTable
              users={allUsers}
              searchPlaceholder="Search users by name or email…"
              emptyEmoji="👥"
              token={token}
              onStatusChange={handleStatusChange}
              onBulkStatusChange={handleBulkStatusChange}
              currentUserId={currentUserId}
              currentUserRole={currentUserRole}
            />
          </div>

          <div className="adminSection">
            <h2 className="adminSectionTitle">Recent Audit Logs</h2>
            <AuditLogsTable logs={localDashboard.auditLogs ?? []} />
          </div>

          {error && (
            <div className="adminError">
              <span>⚠️</span>
              <p>{error}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
