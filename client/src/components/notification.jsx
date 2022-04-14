import React from "react";
import { notification } from "antd";

export function notify({
  message = "",
  description = undefined,
  txid = "",
  url = "",
  type = "info",
  placement = "bottomLeft",
  color = "white",
}) {
  if (url) {
    description = <a href={url}>{description}</a>;
  }
  notification[type]({
    message: <span style={{ color: "black" }}>{message}</span>,
    description: (
      <span style={{ color: "black", opacity: 0.5 }}>{description}</span>
    ),
    placement,
    style: {
      backgroundColor: color,
    },
  });
}
