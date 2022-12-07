import React, { useRef } from "react";

import classes from "./FileInput.module.css";

function FileInput({
  id,
  name,
  required,
  accept = "*",
  acceptValidator = () => true,
  multiple = false,
  placeholder,
  className,
  onChange,
}) {
  if (!placeholder) {
    placeholder = multiple
      ? "Click to select files or drop them here"
      : "Click to select a file or drop it here";
  }

  const ref = useRef(null);

  const onDrag = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const onDrop = (e) => {
    e.preventDefault();
    const droppedFiles = [];

    if (e.dataTransfer.items) {
      [...e.dataTransfer.items].forEach((item) => {
        if (item.kind !== "file") return;
        droppedFiles.push(item.getAsFile());
      });
    } else {
      [...e.dataTransfer.files].forEach((f) => {
        droppedFiles.push(f);
      });
    }

    onChange(droppedFiles.filter(acceptValidator));
  };

  const onInputChange = () => onChange([...ref.current?.files]);

  return (
    <>
      <label
        className={[className, classes.label].join(" ")}
        htmlFor={id}
        onDragEnter={onDrag}
        onDragOver={onDrag}
        onDrop={onDrop}
      >
        <div>{placeholder}</div>

        <input
          ref={ref}
          className={classes.input}
          id={id}
          name={name}
          required={required}
          type="file"
          accept={accept}
          multiple={multiple}
          placeholder={placeholder}
          onChange={onInputChange}
        />
      </label>
    </>
  );
}

export default FileInput;
