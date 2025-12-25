import { useState } from 'react';
import { DictTypeList } from './dict-type-list';
import { DictDataList } from './dict-data-list';
import { type DictType } from './api';

export default function DictionaryPage() {
  const [selectedType, setSelectedType] = useState<DictType | null>(null);

  return (
    <div className="h-[calc(100vh-8rem)] border rounded-lg overflow-hidden bg-background shadow-sm flex">
      <div className="w-[300px] min-w-[300px]">
        <DictTypeList 
            selectedType={selectedType} 
            onSelectType={setSelectedType} 
        />
      </div>
      <div className="flex-1 bg-muted/10">
        {selectedType ? (
          <DictDataList key={selectedType.id} type={selectedType} />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
            <p>Select a dictionary type to manage values</p>
          </div>
        )}
      </div>
    </div>
  );
}
