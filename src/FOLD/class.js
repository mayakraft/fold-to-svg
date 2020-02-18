/**
 * fold to svg (c) Robby Kraft
 */

import * as K from "../keys";

export const all_classes = function (graph) {
  const file_classes = (graph[K.file_classes] != null
    ? graph[K.file_classes] : []).join(" ");
  const frame_classes = (graph[K.frame_classes] != null
    ? graph[K.frame_classes] : []).join(" ");
  return [file_classes, frame_classes]
    .filter(s => s !== "")
    .join(" ");
};
