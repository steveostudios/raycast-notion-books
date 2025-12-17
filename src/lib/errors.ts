import { Toast, showToast } from "@raycast/api";

export function fail(title: string, message?: string) {
  showToast({
    style: Toast.Style.Failure,
    title,
    message,
  });
}

export function success(title: string, message?: string) {
  showToast({
    style: Toast.Style.Success,
    title,
    message,
  });
}

