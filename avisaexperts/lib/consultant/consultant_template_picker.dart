import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../config/app_config.dart';

class ConsultantTemplatePicker extends StatefulWidget {
  final String agentId;
  final Function(String content) onSelect;

  const ConsultantTemplatePicker({
    super.key,
    required this.agentId,
    required this.onSelect,
  });

  @override
  State<ConsultantTemplatePicker> createState() =>
      _ConsultantTemplatePickerState();
}

class _ConsultantTemplatePickerState extends State<ConsultantTemplatePicker> {
  List<Map<String, dynamic>> _templates = [];
  bool _loading = true;
  bool _showCreate = false;
  final _titleController = TextEditingController();
  final _contentController = TextEditingController();
  String? _editingId;

  @override
  void initState() {
    super.initState();
    _fetchTemplates();
  }

  @override
  void dispose() {
    _titleController.dispose();
    _contentController.dispose();
    super.dispose();
  }

  Future<void> _fetchTemplates() async {
    try {
      final url =
          '${AppConfig.templates}?agent_id=${widget.agentId}';
      final resp =
          await http.get(Uri.parse(url)).timeout(const Duration(seconds: 15));
      if (resp.statusCode == 200) {
        final data = json.decode(resp.body);
        if (mounted) {
          setState(() {
            _templates = List<Map<String, dynamic>>.from(
                (data['templates'] as List?) ?? []);
            _loading = false;
          });
        }
      }
    } catch (_) {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _save() async {
    final title = _titleController.text.trim();
    final content = _contentController.text.trim();
    if (title.isEmpty || content.isEmpty) return;

    final body = {
      'agent_id': widget.agentId,
      'title': title,
      'content': content,
    };

    if (_editingId != null) {
      await http.put(
        Uri.parse('${AppConfig.templates}/${_editingId}'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode(body),
      );
    } else {
      await http.post(
        Uri.parse(AppConfig.templates),
        headers: {'Content-Type': 'application/json'},
        body: json.encode(body),
      );
    }
    _cancelEdit();
    _fetchTemplates();
  }

  Future<void> _delete(String id) async {
    await http.delete(
      Uri.parse('${AppConfig.templates}/$id?agent_id=${widget.agentId}'),
    );
    _fetchTemplates();
  }

  void _startEdit(Map<String, dynamic> t) {
    setState(() {
      _editingId = t['id'];
      _titleController.text = t['title'] ?? '';
      _contentController.text = t['content'] ?? '';
      _showCreate = true;
    });
  }

  void _cancelEdit() {
    setState(() {
      _editingId = null;
      _titleController.clear();
      _contentController.clear();
      _showCreate = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      constraints: BoxConstraints(
        maxHeight: MediaQuery.of(context).size.height * 0.7,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Header
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              border: Border(bottom: BorderSide(color: Colors.grey.shade200)),
            ),
            child: Row(
              children: [
                const Text(
                  'Templates',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const Spacer(),
                if (!_showCreate)
                  IconButton(
                    icon: const Icon(Icons.add_circle_outline,
                        color: Color(0xFF0D47A1)),
                    onPressed: () =>
                        setState(() => _showCreate = true),
                    tooltip: 'Create template',
                  )
                else
                  TextButton(
                    onPressed: _cancelEdit,
                    child: const Text('Cancel'),
                  ),
              ],
            ),
          ),

          // Create/Edit form
          if (_showCreate) ...[
            Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                children: [
                  TextField(
                    controller: _titleController,
                    decoration: const InputDecoration(
                      labelText: 'Template title',
                      border: OutlineInputBorder(),
                      contentPadding:
                          EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    ),
                  ),
                  const SizedBox(height: 10),
                  TextField(
                    controller: _contentController,
                    maxLines: 3,
                    decoration: const InputDecoration(
                      labelText: 'Message content',
                      border: OutlineInputBorder(),
                      contentPadding:
                          EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    ),
                  ),
                  const SizedBox(height: 10),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: _save,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF0D47A1),
                        foregroundColor: Colors.white,
                      ),
                      child: Text(
                          _editingId != null ? 'Update' : 'Create'),
                    ),
                  ),
                ],
              ),
            ),
            Divider(color: Colors.grey.shade200),
          ],

          // List
          if (_loading)
            const Padding(
              padding: EdgeInsets.all(40),
              child: CircularProgressIndicator(),
            )
          else if (_templates.isEmpty)
            Padding(
              padding: const EdgeInsets.all(40),
              child: Column(
                children: [
                  Icon(Icons.article_outlined,
                      size: 48, color: Colors.grey.shade400),
                  const SizedBox(height: 12),
                  const Text('No templates yet',
                      style: TextStyle(color: Colors.grey)),
                  const SizedBox(height: 4),
                  Text('Create your first template to send quick replies.',
                      style: TextStyle(
                          color: Colors.grey.shade500, fontSize: 13)),
                ],
              ),
            )
          else
            Flexible(
              child: ListView.builder(
                shrinkWrap: true,
                padding: const EdgeInsets.symmetric(vertical: 4),
                itemCount: _templates.length,
                itemBuilder: (context, index) {
                  final t = _templates[index];
                  return ListTile(
                    title: Text(t['title'] ?? '',
                        style: const TextStyle(fontWeight: FontWeight.w600)),
                    subtitle: Text(
                      t['content'] ?? '',
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(color: Colors.grey.shade600),
                    ),
                    trailing: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        IconButton(
                          icon: Icon(Icons.edit_outlined,
                              size: 20, color: Colors.grey.shade500),
                          onPressed: () => _startEdit(t),
                        ),
                        IconButton(
                          icon: Icon(Icons.delete_outline,
                              size: 20, color: Colors.red.shade300),
                          onPressed: () => _delete(t['id']),
                        ),
                      ],
                    ),
                    onTap: () {
                      widget.onSelect(t['content'] ?? '');
                      Navigator.pop(context);
                    },
                  );
                },
              ),
            ),
        ],
      ),
    );
  }
}
