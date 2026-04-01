"use client";

import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const ChaptersAccordion = ({ chapters }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  if (!chapters || chapters.length === 0)
    return <p className="text-gray-400 text-center py-6">ยังไม่มีตอนของนิยาย</p>;

  const chunkSize = 50;
  const chunkedChapters = [];

  for (let i = 0; i < chapters.length; i += chunkSize) {
    chunkedChapters.push(chapters.slice(i, i + chunkSize));
  }

  const handleChapterClick = (chapterNumber) => {
    // ไปหน้าตอนนั้น เช่น /novel/:id/chapter/:chapterNumber
    navigate(`/novel/${id}/chapter/${chapterNumber}`);
  };

  return (
    <Accordion type="single" collapsible className="w-full space-y-2">
      {chunkedChapters.map((chunk, idx) => {
        const start = idx * chunkSize + 1;
        const end = idx * chunkSize + chunk.length;

        return (
          <AccordionItem key={idx} value={`chapters-${idx}`}>
            <AccordionTrigger className="cursor-pointer">
              ตอนที่ {start} - {end}
            </AccordionTrigger>
            <AccordionContent className="flex flex-col gap-2">
              {chunk.map((ch, i) => (
                <div
                  key={ch.chapter_number}
                  onClick={() => handleChapterClick(ch.chapter_number)}
                  className="flex flex-col sm:flex-row justify-between px-4 py-2 rounded-md hover:bg-gray-50 cursor-pointer border border-gray-100"
                >
                  <span className="mb-1 sm:mb-0">{ch.title}</span>
                  <span className="text-gray-400 text-sm">
                    {new Intl.DateTimeFormat("th-TH", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }).format(new Date(ch.updated_at))} น.
                  </span>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
};

export default ChaptersAccordion;
