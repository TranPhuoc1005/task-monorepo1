import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    TextInput,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Task } from "../../../../packages/shared/src/types/task";
import { LinearGradient } from "expo-linear-gradient";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { useTasks } from "@/useTasks";

interface TaskModalProps {
    visible: boolean;
    task?: Task | null;
    defaultStatus?: Task["status"];
    defaultDueDate?: string;
    onClose: () => void;
}

interface UserOption {
    id: string;
    label: string;
}

export default function TaskModal({ visible, task, defaultStatus = "todo", defaultDueDate, onClose }: TaskModalProps) {
    const { createTask, updateTask, currentUser } = useTasks();
    const [users, setUsers] = useState<UserOption[]>([]);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        status: defaultStatus,
        priority: "medium" as Task["priority"],
        due_date: "",
        user_id: "",
        tags: "",
    });

    const [dueDate, setDueDate] = useState<Date | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);

    const isEdit = !!task;

    // Load form data when task changes
    useEffect(() => {
        if (task) {
            setFormData({
                title: task.title || "",
                description: task.description || "",
                status: task.status || defaultStatus,
                priority: task.priority || "medium",
                due_date: task?.due_date || defaultDueDate || "",
                user_id: task.user_id || "",
                tags: task.tags?.join(", ") || "",
            });
            if (task.due_date) {
                setDueDate(new Date(task.due_date));
            }
        } else {
            resetForm();

            if (defaultDueDate) {
                setDueDate(new Date(defaultDueDate));
            }
        }
    }, [task, visible, defaultDueDate]);

    // Fetch users for assignment
    useEffect(() => {
        if (visible) {
            fetchUsers();
        }
    }, [visible]);

    const fetchUsers = async () => {
        setUsers([
            { id: "1", label: "John Doe" },
            { id: "2", label: "Jane Smith" },
        ]);
    };

    const resetForm = () => {
        setFormData({
            title: "",
            description: "",
            status: defaultStatus,
            priority: "medium",
            due_date: "",
            user_id: "",
            tags: "",
        });
        setDueDate(null);
    };

    const handleSubmit = async () => {
        if (!formData.title.trim()) {
            Alert.alert("Error", "Please enter a task title");
            return;
        }

        setLoading(true);

        try {
            const taskData = {
                title: formData.title,
                description: formData.description,
                status: formData.status,
                priority: formData.priority,
                user_id: formData.user_id || undefined,
                due_date: dueDate?.toISOString() || undefined,
                tags: formData.tags
                    ? formData.tags
                          .split(",")
                          .map((t) => t.trim())
                          .filter(Boolean)
                    : [],
            };

            if (isEdit && task) {
                await updateTask.mutateAsync({
                    id: task.id,
                    updates: taskData,
                });
                Alert.alert("Success", "Task updated successfully");
            } else {
                await createTask.mutateAsync(taskData);
                Alert.alert("Success", "Task created successfully");
            }

            onClose();
            resetForm();
        } catch (error) {
            console.error("Error saving task:", error);
            Alert.alert("Error", "Failed to save task");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = () => {
        Alert.alert("Delete Task", "Are you sure you want to delete this task?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    onClose();
                },
            },
        ]);
    };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
            <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
                {/* Header */}
                <LinearGradient colors={["#ffffff", "#f8fafc"]} style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Ionicons name="close" size={24} color="#64748b" />
                    </TouchableOpacity>

                    <View style={styles.headerCenter}>
                        <Text style={styles.headerTitle}>{isEdit ? "Edit Task" : "Create Task"}</Text>
                        <Text style={styles.headerSubtitle}>
                            {isEdit ? "Update task details" : "Fill in the details"}
                        </Text>
                    </View>

                    {isEdit && (
                        <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
                            <Ionicons name="trash-outline" size={20} color="#ef4444" />
                        </TouchableOpacity>
                    )}
                </LinearGradient>

                {/* Form */}
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.form}
                    keyboardShouldPersistTaps="handled">
                    {/* Title */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>
                            Title <Text style={styles.required}>*</Text>
                        </Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter task title"
                            value={formData.title}
                            onChangeText={(text) => setFormData({ ...formData, title: text })}
                            editable={!loading}
                        />
                    </View>

                    {/* Description */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Description</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Enter task description"
                            value={formData.description}
                            onChangeText={(text) => setFormData({ ...formData, description: text })}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                            editable={!loading}
                        />
                    </View>

                    {/* Status & Priority */}
                    <View style={styles.row}>
                        <View style={[styles.inputGroup, styles.halfWidth]}>
                            <Text style={styles.label}>Status</Text>
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={formData.status}
                                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                                    enabled={!loading}>
                                    <Picker.Item label="To Do" value="todo" />
                                    <Picker.Item label="In Progress" value="in-progress" />
                                    <Picker.Item label="Review" value="review" />
                                    <Picker.Item label="Done" value="done" />
                                </Picker>
                            </View>
                        </View>

                        <View style={[styles.inputGroup, styles.halfWidth]}>
                            <Text style={styles.label}>Priority</Text>
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={formData.priority}
                                    onValueChange={(value) => setFormData({ ...formData, priority: value })}
                                    enabled={!loading}>
                                    <Picker.Item label="Low" value="low" />
                                    <Picker.Item label="Medium" value="medium" />
                                    <Picker.Item label="High" value="high" />
                                </Picker>
                            </View>
                        </View>
                    </View>

                    {/* Assignee */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Assignee</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={formData.user_id}
                                onValueChange={(value) => setFormData({ ...formData, user_id: value })}
                                enabled={!loading}>
                                <Picker.Item label="Select user..." value="" />
                                {users.map((u) => (
                                    <Picker.Item key={u.id} label={u.label} value={u.id} />
                                ))}
                            </Picker>
                        </View>
                    </View>

                    {/* Due Date */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Due Date</Text>
                        <TouchableOpacity
                            style={styles.dateButton}
                            onPress={() => setShowDatePicker(true)}
                            disabled={loading}>
                            <Ionicons name="calendar-outline" size={20} color="#64748b" />
                            <Text style={styles.dateButtonText}>
                                {dueDate ? dueDate.toLocaleDateString() : "Select date"}
                            </Text>
                            {dueDate && (
                                <TouchableOpacity onPress={() => setDueDate(null)} style={styles.clearDate}>
                                    <Ionicons name="close-circle" size={20} color="#94a3b8" />
                                </TouchableOpacity>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Tags */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Tags</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="design, ui/ux, backend (comma separated)"
                            value={formData.tags}
                            onChangeText={(text) => setFormData({ ...formData, tags: text })}
                            editable={!loading}
                        />
                    </View>

                    {/* Actions */}
                    <View style={styles.actions}>
                        <TouchableOpacity style={styles.cancelButton} onPress={onClose} disabled={loading}>
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                            onPress={handleSubmit}
                            disabled={loading}>
                            <LinearGradient
                                colors={loading ? ["#9ca3af", "#9ca3af"] : ["#3b82f6", "#2563eb"]}
                                style={styles.submitButtonGradient}>
                                {loading ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text style={styles.submitButtonText}>{isEdit ? "Update" : "Create"} Task</Text>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </ScrollView>

                {/* Date Picker */}
                {showDatePicker && (
                    <DateTimePicker
                        value={dueDate || new Date()}
                        mode="date"
                        display="default"
                        onChange={(event, selectedDate) => {
                            setShowDatePicker(Platform.OS === "ios");
                            if (selectedDate) {
                                setDueDate(selectedDate);
                            }
                        }}
                    />
                )}
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
    },
    header: {
        paddingTop: 60,
        paddingBottom: 16,
        paddingHorizontal: 20,
        flexDirection: "row",
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#e2e8f0",
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#f1f5f9",
        alignItems: "center",
        justifyContent: "center",
    },
    headerCenter: {
        flex: 1,
        marginLeft: 16,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#1e293b",
    },
    headerSubtitle: {
        fontSize: 14,
        color: "#64748b",
        marginTop: 2,
    },
    deleteButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#fee2e2",
        alignItems: "center",
        justifyContent: "center",
    },
    scrollView: {
        flex: 1,
    },
    form: {
        padding: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: "#334155",
        marginBottom: 8,
    },
    required: {
        color: "#ef4444",
    },
    input: {
        backgroundColor: "#f8fafc",
        borderWidth: 1,
        borderColor: "#e2e8f0",
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: "#1e293b",
    },
    textArea: {
        height: 100,
        paddingTop: 12,
    },
    row: {
        flexDirection: "row",
        gap: 12,
    },
    halfWidth: {
        flex: 1,
    },
    pickerContainer: {
        backgroundColor: "#f8fafc",
        borderWidth: 1,
        borderColor: "#e2e8f0",
        borderRadius: 8,
        overflow: "hidden",
    },
    dateButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f8fafc",
        borderWidth: 1,
        borderColor: "#e2e8f0",
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
    },
    dateButtonText: {
        flex: 1,
        fontSize: 16,
        color: "#1e293b",
    },
    clearDate: {
        padding: 4,
    },
    actions: {
        flexDirection: "row",
        gap: 12,
        marginTop: 32,
        marginBottom: 20,
    },
    cancelButton: {
        flex: 1,
        height: 48,
        borderWidth: 1,
        borderColor: "#e2e8f0",
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#64748b",
    },
    submitButton: {
        flex: 1,
        height: 48,
        borderRadius: 8,
        overflow: "hidden",
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitButtonGradient: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "white",
    },
});
