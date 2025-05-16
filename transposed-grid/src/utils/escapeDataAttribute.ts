export function escapeDataAttribute(str: any) {
  return (str.toString() as string).replace(/[&<>"']/g, char => {
    switch (char) {
      // case '&':
      //   return '&amp;';
      // case '<':
      //   return '&lt;';
      // case '>':
      //   return '&gt;';
      // case '"':
      //   return '&quot;';
      // case "'":
      //   return '&#39;';
      case '"':
        return "'";
      default:
        return char;
    }
  });
};
