export const mergeObjects = (
  obj1: Record<string, unknown>,
  obj2: Record<string, unknown> = {}
): Record<string, unknown> => {
  // create a new object that will be the merged version of obj1 and obj2
  const mergedObj: Record<string, unknown> = {};

  // loop through all the keys in obj1
  for (const key of Object.keys(obj1)) {
    // if the key is not present in obj2, or if the value at that key is not an object,
    // add the key-value pair to the merged object
    if (!obj2.hasOwnProperty(key) || typeof obj1[key] !== 'object') {
      mergedObj[key] = obj1[key];
    } else {
      // if the value at the key in obj1 is an object and the same key exists in obj2,
      // merge the objects and add the merged object to the mergedObj
      mergedObj[key] = mergeObjects(
        obj1[key] as Record<string, unknown>,
        obj2[key] as Record<string, unknown>
      );
    }
  }

  // loop through all the keys in obj2
  for (const key of Object.keys(obj2)) {
    // if the key is not present in obj1 or if the value at that key is not an object,
    // add the key-value pair to the merged object
    if (!obj1.hasOwnProperty(key) || typeof obj2[key] !== 'object') {
      mergedObj[key] = obj2[key];
    } else {
      // if the value at the key in obj2 is an object and the same key exists in obj1,
      // merge the objects and add the merged object to the mergedObj
      mergedObj[key] = mergeObjects(
        obj1[key] as Record<string, unknown>,
        obj2[key] as Record<string, unknown>
      );
    }
  }

  return mergedObj;
};
