import { Target, GripVertical } from "lucide-react";
import { useState } from "react";
import { useDrag, useDrop } from "react-dnd";

interface Step3Props {
  data: any;
  updateData: (data: any) => void;
}

const INTEREST_AREAS = [
  "Software Development",
  "Data Science & AI",
  "Cybersecurity",
  "Product Management",
  "Research & Development",
  "Consulting",
  "Entrepreneurship",
  "Teaching/Academia",
];

const CAREER_VALUES = [
  "High Salary",
  "Work-Life Balance",
  "Job Security",
  "Career Growth",
  "Innovation & Creativity",
  "Social Impact",
  "Leadership Opportunities",
  "Flexibility",
];

interface DraggableItemProps {
  item: string;
  index: number;
  moveItem: (dragIndex: number, hoverIndex: number) => void;
}

function DraggableItem({ item, index, moveItem }: DraggableItemProps) {
  const [{ isDragging }, drag] = useDrag({
    type: "ITEM",
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: "ITEM",
    hover: (draggedItem: { index: number }) => {
      if (draggedItem.index !== index) {
        moveItem(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });

  return (
    <div
      ref={(node) => drag(drop(node))}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg bg-muted border border-border cursor-move hover:border-primary transition-all ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <GripVertical className="w-5 h-5 text-muted-foreground" />
      <span className="text-foreground">{item}</span>
      <span className="ml-auto text-primary">#{index + 1}</span>
    </div>
  );
}

export function Step3Priorities({ data, updateData }: Step3Props) {
  const [interestList, setInterestList] = useState(
    data.interestAreas?.length > 0 ? data.interestAreas : INTEREST_AREAS.slice(0, 5)
  );
  const [valuesList, setValuesList] = useState(
    data.careerValues?.length > 0 ? data.careerValues : CAREER_VALUES.slice(0, 5)
  );

  const moveInterest = (dragIndex: number, hoverIndex: number) => {
    const newList = [...interestList];
    const draggedItem = newList[dragIndex];
    newList.splice(dragIndex, 1);
    newList.splice(hoverIndex, 0, draggedItem);
    setInterestList(newList);
    updateData({ interestAreas: newList });
  };

  const moveValue = (dragIndex: number, hoverIndex: number) => {
    const newList = [...valuesList];
    const draggedItem = newList[dragIndex];
    newList.splice(dragIndex, 1);
    newList.splice(hoverIndex, 0, draggedItem);
    setValuesList(newList);
    updateData({ careerValues: newList });
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-sm">
          <Target className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl text-foreground font-bold">Priorities</h2>
          <p className="text-muted-foreground">Rank your interests and career values</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Interest Areas */}
        <div>
          <h3 className="text-lg text-foreground mb-3">Interest Areas</h3>
          <p className="text-sm text-muted-foreground mb-4">Drag to reorder by preference</p>
          <div className="space-y-2">
            {interestList.map((item, index) => (
              <DraggableItem
                key={item}
                item={item}
                index={index}
                moveItem={moveInterest}
              />
            ))}
          </div>
        </div>

        {/* Career Values */}
        <div>
          <h3 className="text-lg text-foreground mb-3">Career Values</h3>
          <p className="text-sm text-muted-foreground mb-4">Drag to reorder by importance</p>
          <div className="space-y-2">
            {valuesList.map((item, index) => (
              <DraggableItem
                key={item}
                item={item}
                index={index}
                moveItem={moveValue}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
