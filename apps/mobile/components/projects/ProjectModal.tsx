import React, { useState, useEffect } from "react";
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { X, Code, Calendar, DollarSign, Flag, Users, Briefcase } from "lucide-react-native";
import { Project } from "@taskpro/shared";

interface ProjectModalProps {
    visible: boolean;
    onClose: () => void;
    project?: Project | null;
    onSubmit: (data: Partial<Project>) => void;
    onDelete?: (id: string) => void;
    isSubmitting?: boolean;
}

const PROJECT_TYPES = [
    { value: "web_development", label: "Web Dev", icon: "💻" },
    { value: "mobile_app", label: "Mobile", icon: "📱" },
    { value: "design", label: "Design", icon: "🎨" },
    { value: "infrastructure", label: "Infrastructure", icon: "🏗️" },
    { value: "data_science", label: "Data Science", icon: "📊" },
    { value: "other", label: "Other", icon: "📦" },
];

const STATUS_OPTIONS = [
    { value: "planning", label: "Planning", color: "#64748b" },
    { value: "active", label: "Active", color: "#10b981" },
    { value: "on_hold", label: "On Hold", color: "#f59e0b" },
    { value: "completed", label: "Completed", color: "#3b82f6" },
    { value: "cancelled", label: "Cancelled", color: "#ef4444" },
];

const PRIORITY_OPTIONS = [
    { value: "low", label: "Low", color: "#3b82f6" },
    { value: "medium", label: "Medium", color: "#f59e0b" },
    { value: "high", label: "High", color: "#f97316" },
    { value: "critical", label: "Critical", color: "#ef4444" },
];

const TECH_SUGGESTIONS = [
    "React",
    "Vue.js",
    "Angular",
    "Node.js",
    "Python",
    "Java",
    "TypeScript",
    "JavaScript",
    "Docker",
    "Kubernetes",
    "AWS",
    "PostgreSQL",
    "MongoDB",
    "Redis",
];

const LANG_SUGGESTIONS = [
    "JavaScript",
    "TypeScript",
    "Python",
    "Java",
    "C#",
    "Go",
    "Rust",
    "PHP",
    "Ruby",
    "Swift",
    "Kotlin",
];

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"];

export default function ProjectModal({
    visible,
    onClose,
    project,
    onSubmit,
    onDelete,
    isSubmitting,
}: ProjectModalProps) {
    const isEdit = !!project;
    const [formData, setFormData] = useState<Partial<Project>>({
        name: "",
        description: "",
        project_type: "web_development",
        status: "planning",
        priority: "medium",
        progress: 0,
        technologies: [],
        programming_languages: [],
        budget: 0,
        currency: "USD",
        color: "#3b82f6",
        start_date: "",
        deadline: "",
        client_name: "",
        client_email: "",
    });
    const [techInput, setTechInput] = useState("");
    const [langInput, setLangInput] = useState("");

    useEffect(() => {
        if (!visible) return;

        setTechInput("");
        setLangInput("");

        if (project && project.id) {
            setFormData({
                ...project,
                start_date: project.start_date ? project.start_date.split("T")[0] : "",
                deadline: project.deadline ? project.deadline.split("T")[0] : "",
            });
        } else {
            setFormData({
                name: "",
                description: "",
                project_type: "web_development",
                status: "planning",
                priority: "medium",
                progress: 0,
                technologies: [],
                programming_languages: [],
                budget: 0,
                currency: "USD",
                color: "#3b82f6",
                start_date: "",
                deadline: "",
                client_name: "",
                client_email: "",
            });
        }
    }, [visible]);

    const handleAddTech = (tech: string) => {
        const trimmed = tech.trim();
        if (trimmed && !formData.technologies?.includes(trimmed)) {
            setFormData({
                ...formData,
                technologies: [...(formData.technologies || []), trimmed],
            });
            setTechInput("");
        }
    };

    const handleRemoveTech = (tech: string) => {
        setFormData({
            ...formData,
            technologies: formData.technologies?.filter((t) => t !== tech),
        });
    };

    const handleAddLang = (lang: string) => {
        const trimmed = lang.trim();
        if (trimmed && !formData.programming_languages?.includes(trimmed)) {
            setFormData({
                ...formData,
                programming_languages: [...(formData.programming_languages || []), trimmed],
            });
            setLangInput("");
        }
    };

    const handleRemoveLang = (lang: string) => {
        setFormData({
            ...formData,
            programming_languages: formData.programming_languages?.filter((l) => l !== lang),
        });
    };

    const handleSubmit = () => {
        if (!formData.name?.trim()) {
            Alert.alert("Error", "Project name is required");
            return;
        }
        if (!formData.deadline) {
            Alert.alert("Error", "Deadline is required");
            return;
        }

        // Convert dates to ISO string
        const submitData = {
            ...formData,
            start_date: formData.start_date ? new Date(formData.start_date).toISOString() : undefined,
            deadline: formData.deadline ? new Date(formData.deadline).toISOString() : undefined,
        };

        onSubmit(submitData);
    };

    const handleDelete = () => {
        Alert.alert("Delete Project", "Are you sure you want to delete this project?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: () => {
                    if (onDelete && project?.id) {
                        onDelete(project.id);
                    }
                },
            },
        ]);
    };

    return (
        <Modal visible={visible} animationType="slide" onRequestClose={onClose} presentationStyle="pageSheet">
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
                keyboardVerticalOffset={0}>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.modalTitle}>{isEdit ? "Edit Project" : "Create New Project"}</Text>
                        <Text style={styles.modalDesc}>
                            {isEdit ? "Update project information" : "Fill in project details"}
                        </Text>
                    </View>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <X size={24} color="#64748b" />
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalContainer} showsVerticalScrollIndicator={false}>
                    {/* Basic Info */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            <Briefcase size={16} color="#64748b" /> Basic Information
                        </Text>

                        <Text style={styles.label}>Project Name *</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.name}
                            onChangeText={(text) => setFormData({ ...formData, name: text })}
                            placeholder="E-Commerce Platform Redesign"
                            placeholderTextColor="#94a3b8"
                        />

                        <Text style={styles.label}>Description</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            multiline
                            numberOfLines={4}
                            value={formData.description}
                            onChangeText={(text) => setFormData({ ...formData, description: text })}
                            placeholder="Brief description of the project..."
                            placeholderTextColor="#94a3b8"
                        />

                        <Text style={styles.label}>Project Type</Text>
                        <View style={styles.chipContainer}>
                            {PROJECT_TYPES.map((type) => (
                                <TouchableOpacity
                                    key={type.value}
                                    style={[styles.chip, formData.project_type === type.value && styles.activeChip]}
                                    onPress={() => setFormData({ ...formData, project_type: type.value as any })}>
                                    <Text
                                        style={[
                                            styles.chipText,
                                            formData.project_type === type.value && styles.activeChipText,
                                        ]}>
                                        {type.icon} {type.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Status & Priority */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            <Flag size={16} color="#64748b" /> Status & Priority
                        </Text>

                        <Text style={styles.label}>Status</Text>
                        <View style={styles.chipContainer}>
                            {STATUS_OPTIONS.map((status) => (
                                <TouchableOpacity
                                    key={status.value}
                                    style={[
                                        styles.chip,
                                        formData.status === status.value && {
                                            backgroundColor: status.color + "20",
                                            borderColor: status.color,
                                        },
                                    ]}
                                    onPress={() => setFormData({ ...formData, status: status.value as any })}>
                                    <Text
                                        style={[
                                            styles.chipText,
                                            formData.status === status.value && { color: status.color },
                                        ]}>
                                        {status.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.label}>Priority</Text>
                        <View style={styles.chipContainer}>
                            {PRIORITY_OPTIONS.map((priority) => (
                                <TouchableOpacity
                                    key={priority.value}
                                    style={[
                                        styles.chip,
                                        formData.priority === priority.value && {
                                            backgroundColor: priority.color + "20",
                                            borderColor: priority.color,
                                        },
                                    ]}
                                    onPress={() => setFormData({ ...formData, priority: priority.value as any })}>
                                    <Text
                                        style={[
                                            styles.chipText,
                                            formData.priority === priority.value && { color: priority.color },
                                        ]}>
                                        {priority.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.label}>Progress (%)</Text>
                        <TextInput
                            style={styles.input}
                            value={String(formData.progress || 0)}
                            onChangeText={(text) => {
                                const num = parseInt(text) || 0;
                                setFormData({ ...formData, progress: Math.min(100, Math.max(0, num)) });
                            }}
                            placeholder="0"
                            keyboardType="numeric"
                            placeholderTextColor="#94a3b8"
                        />
                    </View>

                    {/* Technologies */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            <Code size={16} color="#64748b" /> Technologies
                        </Text>
                        <TextInput
                            style={styles.input}
                            value={techInput}
                            onChangeText={setTechInput}
                            placeholder="Type and press enter to add"
                            placeholderTextColor="#94a3b8"
                            onSubmitEditing={() => {
                                if (techInput.trim()) handleAddTech(techInput);
                            }}
                        />
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.suggestions}>
                            {TECH_SUGGESTIONS.map((tech) => (
                                <TouchableOpacity
                                    key={tech}
                                    style={styles.suggestionButton}
                                    onPress={() => handleAddTech(tech)}>
                                    <Text style={styles.suggestionText}>+ {tech}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <View style={styles.tags}>
                            {formData.technologies?.map((tech) => (
                                <View key={tech} style={styles.tag}>
                                    <Text style={styles.tagText}>{tech}</Text>
                                    <TouchableOpacity onPress={() => handleRemoveTech(tech)}>
                                        <X size={14} color="#1e40af" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Programming Languages */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            <Code size={16} color="#64748b" /> Programming Languages
                        </Text>
                        <TextInput
                            style={styles.input}
                            value={langInput}
                            onChangeText={setLangInput}
                            placeholder="Type and press enter to add"
                            placeholderTextColor="#94a3b8"
                            onSubmitEditing={() => {
                                if (langInput.trim()) handleAddLang(langInput);
                            }}
                        />
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.suggestions}>
                            {LANG_SUGGESTIONS.map((lang) => (
                                <TouchableOpacity
                                    key={lang}
                                    style={styles.suggestionButton}
                                    onPress={() => handleAddLang(lang)}>
                                    <Text style={styles.suggestionText}>+ {lang}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <View style={styles.tags}>
                            {formData.programming_languages?.map((lang) => (
                                <View key={lang} style={styles.tag}>
                                    <Text style={styles.tagText}>{lang}</Text>
                                    <TouchableOpacity onPress={() => handleRemoveLang(lang)}>
                                        <X size={14} color="#1e40af" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Dates & Budget */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            <Calendar size={16} color="#64748b" /> Timeline & Budget
                        </Text>

                        <Text style={styles.label}>Start Date</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.start_date}
                            onChangeText={(text) => setFormData({ ...formData, start_date: text })}
                            placeholder="YYYY-MM-DD"
                            placeholderTextColor="#94a3b8"
                        />

                        <Text style={styles.label}>Deadline *</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.deadline}
                            onChangeText={(text) => setFormData({ ...formData, deadline: text })}
                            placeholder="YYYY-MM-DD"
                            placeholderTextColor="#94a3b8"
                        />

                        <Text style={styles.label}>Budget (USD)</Text>
                        <TextInput
                            style={styles.input}
                            value={String(formData.budget || 0)}
                            onChangeText={(text) => setFormData({ ...formData, budget: parseInt(text) || 0 })}
                            placeholder="50000"
                            keyboardType="numeric"
                            placeholderTextColor="#94a3b8"
                        />
                    </View>

                    {/* Client Info */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            <Users size={16} color="#64748b" /> Client Information
                        </Text>

                        <Text style={styles.label}>Client Name</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.client_name}
                            onChangeText={(text) => setFormData({ ...formData, client_name: text })}
                            placeholder="Acme Corporation"
                            placeholderTextColor="#94a3b8"
                        />

                        <Text style={styles.label}>Client Email</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.client_email}
                            onChangeText={(text) => setFormData({ ...formData, client_email: text })}
                            placeholder="contact@acme.com"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            placeholderTextColor="#94a3b8"
                        />
                    </View>

                    {/* Color Picker */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Project Color</Text>
                        <View style={styles.colorPicker}>
                            {COLORS.map((color) => (
                                <TouchableOpacity
                                    key={color}
                                    style={[
                                        styles.colorOption,
                                        { backgroundColor: color },
                                        formData.color === color && styles.selectedColor,
                                    ]}
                                    onPress={() => setFormData({ ...formData, color })}
                                />
                            ))}
                        </View>
                    </View>

                    <View style={{ height: 100 }} />
                </ScrollView>

                {/* Footer */}
                <View style={styles.footer}>
                    <TouchableOpacity style={styles.cancelButton} onPress={onClose} disabled={isSubmitting}>
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>

                    {isEdit && onDelete && (
                        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete} disabled={isSubmitting}>
                            <Text style={styles.deleteButtonText}>Delete</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        style={[
                            styles.submitButton,
                            (!formData.name || !formData.deadline || isSubmitting) && styles.disabledButton,
                        ]}
                        onPress={handleSubmit}
                        disabled={isSubmitting || !formData.name || !formData.deadline}>
                        <Text style={styles.submitButtonText}>
                            {isSubmitting ? "Saving..." : isEdit ? "Update" : "Create"}
                        </Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 16,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#f1f5f9",
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#f1f5f9",
        alignItems: "center",
        justifyContent: "center",
    },
    modalContainer: {
        flex: 1,
        backgroundColor: "#f8fafc",
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#0f172a",
        marginBottom: 4,
    },
    modalDesc: {
        fontSize: 14,
        color: "#64748b",
    },
    section: {
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#0f172a",
        marginBottom: 16,
        flexDirection: "row",
        alignItems: "center",
    },
    label: {
        fontSize: 13,
        fontWeight: "600",
        color: "#475569",
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: "#e2e8f0",
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
        fontSize: 14,
        color: "#0f172a",
        backgroundColor: "#fff",
    },
    textArea: {
        height: 100,
        textAlignVertical: "top",
    },
    chipContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginBottom: 16,
    },
    chip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        backgroundColor: "#f1f5f9",
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#e2e8f0",
    },
    activeChip: {
        backgroundColor: "#2563eb",
        borderColor: "#2563eb",
    },
    chipText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#64748b",
    },
    activeChipText: {
        color: "#fff",
    },
    suggestions: {
        marginBottom: 12,
    },
    suggestionButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: "#f8fafc",
        borderWidth: 1,
        borderColor: "#e2e8f0",
        borderRadius: 6,
        marginRight: 8,
    },
    suggestionText: {
        fontSize: 12,
        color: "#64748b",
        fontWeight: "500",
    },
    tags: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    tag: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: "#dbeafe",
        borderRadius: 16,
    },
    tagText: {
        fontSize: 12,
        color: "#1e40af",
        fontWeight: "600",
    },
    colorPicker: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
    },
    colorOption: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 3,
        borderColor: "transparent",
    },
    selectedColor: {
        borderColor: "#0f172a",
    },
    footer: {
        flexDirection: "row",
        gap: 12,
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: "#fff",
        borderTopWidth: 1,
        borderTopColor: "#f1f5f9",
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 14,
        backgroundColor: "#f1f5f9",
        borderRadius: 12,
        alignItems: "center",
    },
    cancelButtonText: {
        fontSize: 15,
        fontWeight: "600",
        color: "#64748b",
    },
    deleteButton: {
        flex: 1,
        paddingVertical: 14,
        backgroundColor: "#ef4444",
        borderRadius: 12,
        alignItems: "center",
    },
    deleteButtonText: {
        fontSize: 15,
        fontWeight: "600",
        color: "#fff",
    },
    submitButton: {
        flex: 1,
        paddingVertical: 14,
        backgroundColor: "#2563eb",
        borderRadius: 12,
        alignItems: "center",
    },
    disabledButton: {
        opacity: 0.5,
    },
    submitButtonText: {
        fontSize: 15,
        fontWeight: "600",
        color: "#fff",
    },
});
