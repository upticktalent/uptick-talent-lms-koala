"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function GradesPage() {
  // Mock data for now
  const assignments = ["Assignment 1", "Quiz 1", "Midterm Project"];
  const students = [
     { name: "Alice Johnson", grades: [85, 90, 88] },
     { name: "Bob Smith", grades: [78, 85, 82] },
     { name: "Charlie Brown", grades: [92, 88, 95] },
     { name: "Diana Prince", grades: [88, 92, 90] },
  ];

  return (
    <div className="max-w-full p-6 overflow-x-auto">
       <div className="border rounded-lg overflow-hidden">
         <Table>
            <TableHeader className="bg-gray-50">
               <TableRow>
                  <TableHead className="w-[200px] font-semibold">Student</TableHead>
                  {assignments.map(a => <TableHead key={a} className="text-center font-semibold">{a}</TableHead>)}
                  <TableHead className="text-center font-semibold text-blue-600">Average</TableHead>
               </TableRow>
            </TableHeader>
            <TableBody>
               {students.map((student, i) => (
                  <TableRow key={i} className="hover:bg-gray-50">
                     <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                              {student.name.charAt(0)}
                           </div>
                           {student.name}
                        </div>
                     </TableCell>
                     {student.grades.map((g, j) => (
                        <TableCell key={j} className="text-center text-gray-600">{g}%</TableCell>
                     ))}
                     <TableCell className="text-center font-bold text-blue-600">
                        {Math.round(student.grades.reduce((a,b)=>a+b,0)/student.grades.length)}%
                     </TableCell>
                  </TableRow>
               ))}
            </TableBody>
         </Table>
       </div>
    </div>
  );
}
