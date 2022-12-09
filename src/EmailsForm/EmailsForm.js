import React, { useState, useEffect } from "react";

import FileInput from "./FileInput";
import { withEmails, submitEmails } from "./EmailsFormService";

import classes from "./EmailsForm.module.css";

function EmailsForm() {
  const [emailsCount, setEmailsCount] = useState(0);

  const fileTypeValidator = ({ type }) => type === "text/plain";
  const [filesWithEmails, setFilesWithEmails] = useState([]);
  const onFileInputChange = (files) =>
    withEmails(files).then((filesWithEmails) => {
      setFilesWithEmails((currentFilesWithEmails) => [
        ...currentFilesWithEmails,
        ...filesWithEmails.filter(
          (f) =>
            f.emails.length > 0 &&
            !currentFilesWithEmails.some((cf) => cf.key === f.key)
        ),
      ]);
    });

  useEffect(
    () =>
      setEmailsCount(
        filesWithEmails.reduce((total, { emails }) => total + emails.length, 0)
      ),
    [filesWithEmails]
  );

  const onFileDelete = (key) => {
    setFilesWithEmails((currentFilesWithEmails) =>
      currentFilesWithEmails.filter((f) => f.key !== key)
    );
  };

  const [isSubmitting, setIsUploading] = useState(false);
  const [submitResult, setSubmitResult] = useState({});

  const onSubmit = (e) => {
    e.preventDefault();
    setSubmitResult("");
    setIsUploading(true);

    submitEmails(filesWithEmails.flatMap(({ emails }) => emails)).then((v) => {
      setIsUploading(false);
      setSubmitResult(v);
      if (v.message) setFilesWithEmails([]);
    });
  };

  return (
    <form onSubmit={onSubmit}>
      <FileInput
        className={classes["file-input"]}
        id="input"
        name="input"
        required={true}
        accept=".txt"
        acceptValidator={fileTypeValidator}
        multiple={true}
        placeholder="Click to select files with emails or drop them here"
        onChange={onFileInputChange}
      />

      <input
        className={`margin-top-1 ${classes.submit}`}
        id="submit"
        name="submit"
        type="submit"
        value={`Submit${emailsCount === 0 ? "" : ` ${emailsCount}`} email${
          emailsCount === 0 ? "" : "s"
        }`}
        disabled={emailsCount === 0}
      />

      {isSubmitting && <span> Submitting...</span>}

      <div
        className={`margin-top-1 ${
          submitResult.error ? classes.error : classes.success
        }`}
      >
        {submitResult.error ? submitResult.error : submitResult.message}
      </div>

      <div className="margin-top-1">
        {filesWithEmails.map(({ key, name, emails }) => (
          <div key={key}>
            {`${name} has ${emails.length} emails`}

            <span
              className={classes["file-delete-icon"]}
              onClick={() => onFileDelete(key)}
            >
              x
            </span>
          </div>
        ))}
      </div>
    </form>
  );
}

export default EmailsForm;
