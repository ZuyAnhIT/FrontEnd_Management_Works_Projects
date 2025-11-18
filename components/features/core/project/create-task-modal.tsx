"use client";


import { useState } from "react";
import {
  X,
  Plus,
  Sparkles,
  FileText,
  Flag,
  Activity,
  CheckSquare,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/ToastProvider";


// API thật
import { createProjectTask } from "@/services/apiProject";


interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: number;
  workspaceId: number;
  sprintId?: number | null;
  onCreated?: () => void;


}


export function CreateTaskModal({
  isOpen,
  onClose,
  projectId,
  workspaceId,
  sprintId,
  onCreated,
}: CreateTaskModalProps) {
  const { showToast } = useToast();


  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "LOW",
    statusName: "TODO",
    subtasks: [] as { title: string }[],
  });


  const [newSubtask, setNewSubtask] = useState("");
  const [loading, setLoading] = useState(false);


  const handleAddSubtask = () => {
    if (!newSubtask.trim()) return;
    setFormData((prev) => ({
      ...prev,
      subtasks: [...prev.subtasks, { title: newSubtask }],
    }));
    setNewSubtask("");
  };


  const handleRemoveSubtask = (i: number) => {
    setFormData((prev) => ({
      ...prev,
      subtasks: prev.subtasks.filter((_, idx) => idx !== i),
    }));
  };


  // 🚀 CREATE TASK - REAL API
  const handleCreate = async () => {
    if (!formData.title.trim()) {
      showToast("Task title is required!");


      return;
    }


    try {
      setLoading(true);


      const payload = {
        title: formData.title,
        description: formData.description,


        statusName: formData.statusName,
        taskType: "STORY",
        priority: formData.priority,


        storyPoints: 0,
        estimatedHours: 0,


        assigneeId: undefined, // FIX NULL ERROR
        attachments: [],
        links: [],
        sprintId: sprintId ?? undefined,
      };


      await createProjectTask(workspaceId, projectId, payload);


      showToast(`Task "${formData.title}" created successfully!`);




      onCreated?.();


      // Reset state
      setFormData({
        title: "",
        description: "",
        priority: "LOW",
        statusName: "TODO",
        subtasks: [],
      });


      onClose();
    } catch (err: any) {
      console.error("❌ API ERROR:", err?.response?.data || err);


      showToast(err?.response?.data?.message || "Cannot create task");


    } finally {
      setLoading(false);
    }
  };


  if (!isOpen) return null;


  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl border-0 animate-scaleIn flex flex-col">


        {/* HEADER */}
        <CardHeader className="relative overflow-hidden bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 p-8">
          <div className="absolute inset-0 bg-grid-white/10"></div>


          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                <FileText className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-2xl text-white">Create New Task</CardTitle>
                  <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
                </div>
                <p className="text-white/80 text-sm">Add a new task to your project</p>
              </div>
            </div>


            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-xl transition-all duration-300 hover:scale-110 hover:rotate-90 backdrop-blur-sm"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </CardHeader>


        {/* BODY */}
        <CardContent className="p-8 space-y-6 bg-gradient-to-b from-blue-50/30 to-white overflow-y-auto flex-1">


          {/* TITLE */}
          <div>
            <label className="text-sm font-semibold flex items-center gap-2 mb-3 text-gray-700">
              <Sparkles className="w-4 h-4 text-white bg-gradient-to-br from-purple-500 to-pink-500 p-1 rounded" />
              Task Title*
            </label>


            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter task title..."
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3"
            />
          </div>


          {/* DESCRIPTION */}
          <div>
            <label className="text-sm font-semibold flex items-center gap-2 mb-3 text-gray-700">
              <FileText className="w-4 h-4 text-white bg-gradient-to-br from-blue-500 to-cyan-500 p-1 rounded" />
              Description
            </label>


            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter description..."
              rows={3}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 resize-none"
            />
          </div>


          {/* PRIORITY + STATUS */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold mb-3 flex items-center gap-2 text-gray-700">
                <Flag className="w-4 h-4 text-white bg-gradient-to-br from-orange-500 to-red-500 p-1 rounded" />
                Priority
              </label>


              <select
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value })
                }
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl"
              >
                <option value="LOW">🔵 Low</option>
                <option value="MEDIUM">🟡 Medium</option>
                <option value="HIGH">🟠 High</option>
                <option value="CRITICAL">🔴 Critical</option>
              </select>
            </div>


            <div>
              <label className="text-sm font-semibold mb-3 flex items-center gap-2 text-gray-700">
                <Activity className="w-4 h-4 text-white bg-gradient-to-br from-green-500 to-emerald-500 p-1 rounded" />
                Status
              </label>


              <select
                value={formData.statusName}
                onChange={(e) =>
                  setFormData({ ...formData, statusName: e.target.value })
                }
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl"
              >
                <option value="TODO"> To Do</option>
                <option value="IN_PROGRESS"> In Progress</option>
                <option value="REVIEW"> Review</option>
                <option value="DONE"> Done</option>
              </select>
            </div>
          </div>


          {/* SUBTASKS */}
          <div>
            <label className="text-sm font-semibold flex items-center gap-2 mb-3 text-gray-700">
              <CheckSquare className="w-4 h-4 text-white bg-gradient-to-r from-teal-500 to-cyan-500 p-1 rounded" />
              Subtasks
            </label>


            {formData.subtasks.map((st, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-teal-50 rounded-xl border mt-2"
              >
                <span>{st.title}</span>
                <button
                  className="p-2 hover:bg-red-100 rounded-lg"
                  onClick={() => handleRemoveSubtask(index)}
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            ))}


            <div className="flex gap-2 mt-3">
              <Input
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                placeholder="Add subtask..."
                onKeyPress={(e) => e.key === "Enter" && handleAddSubtask()}
              />
              <Button variant="outline" onClick={handleAddSubtask}>
                <Plus className="w-5 h-5" />
              </Button>
            </div>
          </div>


          {/* ACTIONS */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>


            <Button
              onClick={handleCreate}
              disabled={loading}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
            >
              {loading ? "Creating..." : "Create Task"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}



