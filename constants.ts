export const ON_SHAPE_IDENTIFIER = 'Onshape Part URL';

export const ON_SHAPE_PROPERTIES = [
  'Name',
  'Description',
  'Part Number',
  'Revision',
  'State',
  'Material',
  'Vendor',
  'Cost',
  'Weight',
  'Title 1',
  'Title 2',
  'Title 3',
];

// Standard Onshape Property IDs required for making API calls.
export const ON_SHAPE_PROPERTY_ID_MAP: Record<string, string> = {
    'Name': '57f3fb8efa8c52439d51f041',
    'Description': '57f3fb8efa8c52439d51f044',
    'Part Number': '57f3fb8efa8c52439d51f047',
    'Revision': '57f3fb8efa8c52439d51f04a',
    'State': '57f3fb8efa8c52439d51f03b',
    // Material, Vendor, Cost, Weight, and Titles are often custom or special-case properties.
    // They cannot be updated via the standard metadata endpoint with a simple value.
    // For example, 'Material' requires a separate API call to assign from a material library.
    // 'Weight' is a calculated property and cannot be set directly.
};
