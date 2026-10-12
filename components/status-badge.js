import { Badge } from "@/components/ui/badge";

const STATUS_FORMAT_MAP = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  ASSIGNED: "Rider Assigned",
  PICKED_UP: "Picked Up",
  IN_TRANSIT: "In Transit",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  SUCCESSFUL: "Successful",
  FAILED: "Failed",
  REFUNDED: "Refunded",
  AVAILABLE: "Available",
  BUSY: "Busy",
  OFFLINE: "Offline",
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  SUSPENDED: "Suspended",
};

const DELIVERY_STATUS_STYLES = {
  PENDING: { variant: "warning", dot: "bg-amber-500 animate-pulse" },
  CONFIRMED: { variant: "info", dot: "bg-sky-500" },
  ASSIGNED: { variant: "info", dot: "bg-blue-600" },
  PICKED_UP: { variant: "orange", dot: "bg-orange-500" },
  IN_TRANSIT: { variant: "success", dot: "bg-emerald-500 animate-pulse" },
  DELIVERED: { variant: "success", dot: "bg-emerald-600" },
  CANCELLED: { variant: "danger", dot: "bg-rose-500" },
};

const PAYMENT_STATUS_STYLES = {
  PENDING: { variant: "warning", dot: "bg-amber-500" },
  SUCCESSFUL: { variant: "success", dot: "bg-emerald-600" },
  FAILED: { variant: "danger", dot: "bg-rose-500" },
  REFUNDED: { variant: "secondary", dot: "bg-gray-400" },
};

const AVAILABILITY_STYLES = {
  AVAILABLE: { variant: "success", dot: "bg-emerald-500" },
  BUSY: { variant: "warning", dot: "bg-amber-500" },
  OFFLINE: { variant: "secondary", dot: "bg-gray-400" },
};

const USER_STATUS_STYLES = {
  ACTIVE: { variant: "success", dot: "bg-emerald-600" },
  INACTIVE: { variant: "secondary", dot: "bg-gray-400" },
  SUSPENDED: { variant: "danger", dot: "bg-rose-500" },
};

export function StatusBadge({ status, type = "delivery", className = "" }) {
  const config =
    type === "payment"
      ? PAYMENT_STATUS_STYLES[status] || { variant: "secondary", dot: "bg-gray-400" }
      : type === "availability"
        ? AVAILABILITY_STYLES[status] || { variant: "secondary", dot: "bg-gray-400" }
        : type === "user"
          ? USER_STATUS_STYLES[status] || { variant: "secondary", dot: "bg-gray-400" }
          : DELIVERY_STATUS_STYLES[status] || { variant: "secondary", dot: "bg-gray-400" };

  const label = STATUS_FORMAT_MAP[status] || status;

  return (
    <Badge variant={config.variant} className={className}>
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      <span>{label}</span>
    </Badge>
  );
}

export function getDeliveryTimeline(status) {
  const steps = [
    { key: "PENDING", label: "Order Created", desc: "Submitted & waiting confirmation" },
    { key: "CONFIRMED", label: "Confirmed", desc: "Approved for rider pickup" },
    { key: "ASSIGNED", label: "Rider Assigned", desc: "Rider dispatched to pickup" },
    { key: "PICKED_UP", label: "Package Picked Up", desc: "Handed over to rider" },
    { key: "IN_TRANSIT", label: "On The Way", desc: "In transit to destination" },
    { key: "DELIVERED", label: "Delivered", desc: "Successfully delivered" },
  ];

  const statusOrder = ["PENDING", "CONFIRMED", "ASSIGNED", "PICKED_UP", "IN_TRANSIT", "DELIVERED"];
  const currentIndex = statusOrder.indexOf(status);

  return steps.map((step, index) => ({
    label: step.label,
    desc: step.desc,
    key: step.key,
    active: index <= currentIndex,
    current: index === currentIndex,
    isTerminal: status === "CANCELLED",
  }));
}
