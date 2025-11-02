'use client';

import React, { useState } from 'react';
import Box from '../ui/box';
import { faqs } from '@/lib/faq-data';
import { MinusIcon, PlusIcon } from 'lucide-react';

export default function Accordion() {
  const [openId, setOpenId] = useState<string | null>('faq-1');
  return (
    <Box className="space-y-4 sm:space-y-5 cursor-pointer">
      {faqs.map(faq => (
        <Box
          key={faq.id}
          className="group bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl overflow-hidden transition-all duration-300 hover:border-primary/30 "
        >
          <button
            onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
            className="w-full px-5 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 flex items-center justify-between text-left hover:bg-slate-800/50 transition-colors cursor-pointer"
            aria-expanded={openId === faq.id}
          >
            <span className="text-base sm:text-lg md:text-xl font-semibold text-white pr-4 ">
              {faq.question}
            </span>

            {openId !== faq.id ? (
              <PlusIcon
                className={`w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0 transition-transform duration-300 `}
              />
            ) : (
              <MinusIcon
                className={`w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0 transition-transform duration-300 `}
              />
            )}
          </button>

          {/* Answer */}
          <Box
            className={`overflow-hidden transition-all duration-300 ${
              openId === faq.id ? 'max-h-96' : 'max-h-0'
            }`}
          >
            <Box className="px-5 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 border-t border-slate-800 bg-slate-950/50">
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed">{faq.answer}</p>
            </Box>
          </Box>
        </Box>
      ))}
    </Box>
  );
}
