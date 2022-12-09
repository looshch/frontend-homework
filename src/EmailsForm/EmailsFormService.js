export const withEmails = (files) =>
  Promise.all(
    files.map(
      (f) =>
        new Promise((resolve) => {
          const fileReader = new FileReader();
          fileReader.addEventListener("load", ({ target }) => {
            f.emails = target.result
              // Windows uses \r\n as the EOL, Unix-like use \n.
              .split(/\r?\n/)
              .filter((line) => line.match(/.+@.+\..+/));
            f.key = `${f.name}-${f.type}-${f.lastModified}-${f.size}-${f.emails[0]}`;
            resolve(f);
          });
          fileReader.readAsText(f);
        })
    )
  );

export const submitEmails = (emails) => {
  return fetch("https://toggl-hire-frontend-homework.onrender.com/api/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ emails }),
  })
    .then(async (response) => {
      if (response.ok)
        return {
          message: `The email${
            emails.length === 1 ? " was" : "s were"
          } successfully submitted`,
        };

      const payload = await response.json();
      switch (response.status) {
        case 500:
          switch (payload.error) {
            case "server_error":
              return {
                error: "Specific server error",
              };
            case "send_failure":
              return {
                error: `${payload.emails.join(", ")} ${
                  payload.emails.length === 1 ? "was" : "were"
                }n’t submitted`,
              };
            default:
              return {
                error: "Unknown server error",
              };
          }

        case 422:
          switch (payload.error) {
            case "invalid_email_address":
              return {
                error: `${payload.emails.join(", ")} ${
                  payload.emails.length === 1 ? "is" : "are"
                } invalid`,
              };
            case "invalid_request_body":
              return {
                error: "Internal client error",
              };
            default:
              return {
                error: "Unknown client error",
              };
          }

        default:
          return {
            error: "Unknown error",
          };
      }
    })
    .catch((e) => e);
};
