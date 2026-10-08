import { Badge } from "@/components/ui/badge";

const DELIVERY_STATUS_STYLES = {
  PENDING: "warning",
  CONFIRMED: "info",
  ASSIGNED: "info",
  PICKED_UP: "secondary",
  IN_TRANSIT: "secondary",
  DELIVERED: "success",
  CANCELLED: "danger",
};

const PAYMENT_STATUS_STYLES = {
  PENDING: "warning",
  SUCCESSFUL: "success",
  FAILED: "danger",
  REFUNDED: "secondary",
};

const AVAILABILITY_STYLES = {
  AVAILABLE: "success",
  BUSY: "warning",
  OFFLINE: "secondary",
};

const USER_STATUS_STYLES = {
  ACTIVE: "success",
  INACTIVE: "secondary",
  SUSPENDED: "danger",
};

export function StatusBadge({ status, type = "delivery" }) {
  const styles =
    type === "payment"
      ? PAYMENT_STATUS_STYLES[status] || "secondary"
      : type === "availability"
        ? AVAILABILITY_STYLES[status] || "secondary"
        : type === "user"
          ? USER_STATUS_STYLES[status] || "secondary"
          : DELIVERY_STATUS_STYLES[status] || "secondary";

  return <Badge variant={styles}>{status}</Badge>;
}

export function getDeliveryTimeline(status) {
  const steps = ["Created", "Confirmed", "Assigned", "Picked Up", "In Transit", "Delivered"];
  const statusSteps = ["PENDING", "CONFIRMED", "ASSIGNED", "PICKED_UP", "IN_TRANSIT", "DELIVERED"];

  const currentIndex = statusSteps.indexOf(status);
  return steps.map((label, index) => ({
    label,
    active: index <= currentIndex,
    current: index === currentIndex,
    isTerminal: status === "CANCELLED",
  }));
}
