#!/bin/bash
# convert-lodash-imports.sh

# Find all TypeScript and JavaScript files
find src -type f -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | while read -r file; do
  # Replace full lodash import with lodash-es
  sed -i '' 's/import _ from "lodash";/import _ from "lodash-es";/g' "$file"
  sed -i '' "s/import _ from 'lodash';/import _ from 'lodash-es';/g" "$file"
  
  # Replace named imports from lodash with lodash-es
  sed -i '' 's/import {/import {/g' "$file"
  sed -i '' 's/} from "lodash";/} from "lodash-es";/g' "$file"
  sed -i '' "s/} from 'lodash';/} from 'lodash-es';/g" "$file"
  
  echo "Processed $file"
done

echo "Conversion complete!" 