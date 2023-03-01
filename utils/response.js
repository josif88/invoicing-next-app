export const okRes = (res, data) => {
  res.status(200);
  return res.json({
    status: "ok",
    data,
    message: "",
  });
};

export const errorRes = (res, message, redirect = null) => {
  res.status(400);

  //unify message body
  if (typeof message == "string") {
    message = [message];
  }

  return res.json({
    status: "error",
    data: "",
    message,
    redirect,
  });
};

export const unAuthRes = (res, message = "غير مسموح") => {
  res.status(500);

  //unify message body
  if (typeof message == "string") {
    message = [message];
  }

  return res.json({
    status: "error",
    data: "",
    message,
  });
};

export const notfoundRes = (res) => {
  res.status(404);
  return res.json({
    status: "error",
    message: "الصفحة غير موجودة",
  });
};
