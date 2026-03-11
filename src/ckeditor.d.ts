declare module '@ckeditor/ckeditor5-react' {
  import * as React from 'react';

  export interface CKEditorProps {
    editor: any;
    data?: string;
    config?: any;
    onChange?: (event: any, editor: any) => void;
  }

  export class CKEditor extends React.Component<CKEditorProps> {}
}
