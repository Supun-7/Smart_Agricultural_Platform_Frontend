import "../styles/components/notificationCard.css";

export function NotificationCard({ notification, onMarkRead }) {
  const isRead = Boolean(notification.is_read);

  return (
    <article className={`noteCard ${isRead ? "read" : "unread"}`}>
      <div className="noteTop">
        <div className="noteType">{notification.type}</div>
        <span className={`notePill ${isRead ? "pillRead" : "pillUnread"}`}>
          {isRead ? "Read" : "New"}
        </span>
      </div>

      <p className="noteMsg">{notification.message}</p>

      <div className="noteBottom">
        <time className="noteTime">
          {notification.created_at ? new Date(notification.created_at).toLocaleString() : ""}
        </time>

        {!isRead ? (
          <button className="secondaryBtn" type="button" onClick={() => onMarkRead?.(notification.notification_id)}>
            Mark read
          </button>
        ) : null}
      </div>
    </article>
  );
}
