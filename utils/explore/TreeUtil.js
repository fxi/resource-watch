
export function findTagInTree(tree, tag) {
  if (tree.value === tag) {
    return tree;
  } else if (tree.children && tree.children && tree.children.length > 0) {
    let found = false;
    for (let i = 0; i < tree.children.length && !found; i++) {
      found = findTagInTree(tree.children[i], tag);
    }
    return found;
  } else { // eslint-disable-line no-else-return
    return false;
  }
}

export function findTagInSelectorTree(tree, tag) {
  let found = false;
  for (let i = 0; tree && i < tree.length && !found; i++) {
    found = findTagInTree(tree[i], tag);
  }
  return found;
}

export function sortTree(tree) {
  if (tree.length && tree.length > 1) {
    tree.sort((a, b) => {
      if (a.label < b.label) {
        return -1;
      } else if (a.label > b.label) {
        return 1;
      } else { // eslint-disable-line no-else-return
        return 0;
      }
    });

    tree.forEach(val => sortTree(val));
  } else if (tree.children && tree.children.length > 0) {
    tree.children = sortTree(tree.children); // eslint-disable-line no-param-reassign
  }
  return tree;
}
