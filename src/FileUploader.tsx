/*
 * A drag&drop and upload file selector based on the example code
 * from: https://spin.atomicobject.com/2018/09/13/file-uploader-react-typescript/
 */

import React, { useState, useRef, useEffect } from 'react';

interface Props {
  fileTypes: string[],
  onFileSelected: OnFileSelected
}

interface State {
  dragging: boolean,
  file: File | null,
  dragEventCounter: number,
  error: string,
}

const overrideEventDefaults = (event: Event | React.DragEvent<HTMLDivElement>) => {
  event.preventDefault();
  event.stopPropagation();
};

export const FileUploader: React.FC<Props> = ({ fileTypes, onFileSelected }) => {
  const [state, setState] = useState<State>({ dragging: false, file: null, dragEventCounter: 0, error: '' });
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // on mount, add our event listeners
    console.log('mount');
    window.addEventListener('dragover', overrideEventDefaults);
    window.addEventListener('drop', overrideEventDefaults);

    return () => {
      // on unmount, remove our event listeners
      console.log('unmount');
      window.removeEventListener('dragover', overrideEventDefaults);
      window.removeEventListener('drop', overrideEventDefaults);
    };
  }, []);

  useEffect(() => {
    if (state.file !== null) {
      onFileSelected(state.file);
    }
  }, [state.file]);

  const dragEnterListener = (event: React.DragEvent<HTMLDivElement>) => {
    overrideEventDefaults(event);
    if (event.dataTransfer.items && event.dataTransfer.items[0]) {
      setState({ ...state, dragging: true, dragEventCounter: state.dragEventCounter + 1 });
    }
  };

  const dragLeaveListener = (event: React.DragEvent<HTMLDivElement>) => {
    overrideEventDefaults(event);
    setState({ ...state, dragEventCounter: state.dragEventCounter - 1 });

    if (state.dragEventCounter <= 1) {
      setState({ ...state, dragging: false, dragEventCounter: 0 });
    }
  };

  const dropListener = (event: React.DragEvent<HTMLDivElement>) => {
    overrideEventDefaults(event);

    let error = state.error;

    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      /* check file type */
      const file = event.dataTransfer.files[0];
      if (fileTypes.includes(file.type)) {
        /* this file type is accepted, save */
        setState({ dragging: false, file: event.dataTransfer.files[0], dragEventCounter: 0, error: '' });
        return;
      } else {
        error = `Invalid file type ${file.type}.  Please upload a file of type ${fileTypes.join(', ')}`;
      }
    }

    setState({ ...state, dragging: false, dragEventCounter: 0, error });
  };

  const onSelectFileClick = () => {
    if (inputRef.current !== null)
      inputRef.current.click();
  };

  const onFileChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0])
      setState({ ...state, file: event.target.files[0], error: '' });
  };

  let containerClassName = 'file-uploader';
  if (state.dragging)
    containerClassName += ' file-uploader--dragging';

  return (
    <div
      className={containerClassName}
      onDrag={overrideEventDefaults}
      onDragStart={overrideEventDefaults}
      onDragEnd={overrideEventDefaults}
      onDragOver={overrideEventDefaults}

      onDragEnter={dragEnterListener}
      onDragLeave={dragLeaveListener}
      onDrop={dropListener}
    >
      <div className='file-uploader__contents'>
        <span>{state.error}</span>
        <span className='file-uploader__file-name'>{state.file ? state.file.name : 'No file selected'}</span>
        <span>Drag &amp; Drop File</span>
        <span>or</span>
        <span onClick={onSelectFileClick}>Select File</span>
      </div>
      <input
        hidden={true}
        ref={inputRef}
        type='file'
        className='file-uploader__input'
        onChange={onFileChanged}
        accept={fileTypes.join(' ')}
      />
    </div>
  );
};