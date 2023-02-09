export type ToolbarButtonOptions = {
  caption?: string;
  onClick?: () => void;
  // icon?: IconType;
}

export type ToolbarOptions = {
  left?: ToolbarButtonOptions[]
  center?: ToolbarButtonOptions[]
  right?: ToolbarButtonOptions[]
}
