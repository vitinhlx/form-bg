'use client'

import { useState, useRef, useEffect, ChangeEvent } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'

type QuotationItem = {
  id: number
  description: string
  quantity: number
  unit: string
  unitPrice: number
  note: string
}

type QuotationTemplate = {
  name: string
  items: QuotationItem[]
}

const suggestionItems = [
  "Tủ quần áo 1450*800*600 ",
  "Bàn trang điểm 800*750*400 ",
  "Kệ sách 1200*800*350 ",
  "Tab đầu giường 500*500*400",
  "Bàn trang điểm 1200*750*600 ",
]

const suggestedUnits = ["Cái", "Bộ", "m2", "md"]

export default function QuotationForm() {
  const [items, setItems] = useState<QuotationItem[]>([])
  const [description, setDescription] = useState('')
  const [quantity, setQuantity] = useState('')
  const [unit, setUnit] = useState('')
  const [unitPrice, setUnitPrice] = useState('')
  const [note, setNote] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [unitSuggestions, setUnitSuggestions] = useState<string[]>([])
  const [editingItem, setEditingItem] = useState<QuotationItem | null>(null)
  const [templates, setTemplates] = useState<QuotationTemplate[]>([])
  const [templateName, setTemplateName] = useState('')
  const descriptionRef = useRef<HTMLInputElement>(null)
  const printContentRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [editableNotes, setEditableNotes] = useState<string[]>([
    'Sản phẩm gỗ nội thất được bảo hành kỹ thuật 12 tháng (lỗi do kỹ thuật thi công: rơi vỡ, rung lắc,...)',
    'Không bảo hành nước, mối mọt đối với vật liệu gỗ.',
    'Bảng báo giá trên có hiệu lực 30 ngày kể từ ngày báo giá, sẽ có điều chỉnh dựa trên tình hình giá cả vật tư tăng giảm(nếu có). Cảm ơn Quí khách hàng đã tin tưởng và ủng hộ !!!',
    'Thông tin số tài khoản : 0.5555.1368  -  Nguyễn Phước Vĩnh Thành - Ngân Hàng : Nam Á Bank'
  ])
  const [isEditingNotes, setIsEditingNotes] = useState(false)
  const [tempNotes, setTempNotes] = useState<string[]>([])

  const [pageTitle, setPageTitle] = useState('BÁO GIÁ THI CÔNG NỘI THẤT')
  const [factoryName, setFactoryName] = useState('XƯỞNG SX - NỘI THẤT - THÂN THIỆN')
  const [factoryAddress, setFactoryAddress] = useState('Địa chỉ: Khu B4, Phường Đông Xuyên')
  const [factoryHotline, setFactoryHotline] = useState('Hotline: 0918306813 - 0988288701')
  const [factoryEmail, setFactoryEmail] = useState('Email: vitinhlx@gmail.com')
  const [isEditingFactory, setIsEditingFactory] = useState(false)
  const [tempPageTitle, setTempPageTitle] = useState('')
  const [tempFactoryName, setTempFactoryName] = useState('')
  const [tempFactoryAddress, setTempFactoryAddress] = useState('')
  const [tempFactoryHotline, setTempFactoryHotline] = useState('')
  const [tempFactoryEmail, setTempFactoryEmail] = useState('')

  useEffect(() => {
    if (description) {
      const filtered = suggestionItems.filter(item =>
        item.toLowerCase().includes(description.toLowerCase())
      )
      setSuggestions(filtered)
    } else {
      setSuggestions([])
    }
  }, [description])

  useEffect(() => {
    const savedTemplates = localStorage.getItem('quotationTemplates')
    if (savedTemplates) {
      setTemplates(JSON.parse(savedTemplates))
    }
  }, [])

  useEffect(() => {
    const savedNotes = localStorage.getItem('quotationNotes')
    if (savedNotes) {
      setEditableNotes(JSON.parse(savedNotes))
    }
  }, [])

  useEffect(() => {
    const savedPageTitle = localStorage.getItem('pageTitle')
    if (savedPageTitle) {
      setPageTitle(savedPageTitle)
    }
    const savedFactoryInfo = localStorage.getItem('factoryInfo')
    if (savedFactoryInfo) {
      const info = JSON.parse(savedFactoryInfo)
      setFactoryName(info.name)
      setFactoryAddress(info.address)
      setFactoryHotline(info.hotline)
      setFactoryEmail(info.email)
    }
  }, [])

  const addItem = () => {
    if (description && quantity && unit && unitPrice) {
      const newItem = {
        id: editingItem ? editingItem.id : items.length + 1,
        description,
        quantity: Number(quantity),
        unit,
        unitPrice: Number(unitPrice),
        note
      }
      let updatedItems;
      if (editingItem) {
        updatedItems = items.map(item => item.id === editingItem.id ? newItem : item)
      } else {
        updatedItems = [...items, newItem]
      }
      // Recalculate STT for all items
      updatedItems = updatedItems.map((item, index) => ({
        ...item,
        id: index + 1
      }))
      setItems(updatedItems)
      setEditingItem(null)
      setDescription('')
      setQuantity('')
      setUnit('')
      setUnitPrice('')
      setNote('')
      descriptionRef.current?.focus()
    }
  }

  const editItem = (item: QuotationItem) => {
    setEditingItem(item)
    setDescription(item.description)
    setQuantity(item.quantity.toString())
    setUnit(item.unit)
    setUnitPrice(item.unitPrice.toString())
    setNote(item.note)
    descriptionRef.current?.focus()
  }

  const deleteItem = (id: number) => {
    const updatedItems = items.filter(item => item.id !== id).map((item, index) => ({
      ...item,
      id: index + 1
    }))
    setItems(updatedItems)
  }

  const saveTemplate = () => {
    if (templateName && items.length > 0) {
      const newTemplate = { name: templateName, items }
      const updatedTemplates = [...templates, newTemplate]
      setTemplates(updatedTemplates)
      localStorage.setItem('quotationTemplates', JSON.stringify(updatedTemplates))
      setTemplateName('')
    }
  }

  const loadTemplate = (template: QuotationTemplate) => {
    const updatedItems = template.items.map((item, index) => ({
      ...item,
      id: index + 1
    }))
    setItems(updatedItems)
  }

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(items.map(item => ({
      'STT': item.id,
      'Mô tả chi tiết': item.description,
      'Số Lượng': item.quantity,
      'ĐVT': item.unit,
      'Đơn giá': item.unitPrice,
      'Thành tiền': item.quantity * item.unitPrice,
      'Ghi chú': item.note
    })))
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Bảng Báo Giá')
    XLSX.writeFile(workbook, 'bang_bao_gia.xlsx')
  }

  const importFromExcel = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet)
        
        const importedItems: QuotationItem[] = jsonData.map((row: any, index) => ({
          id: index + 1,
          description: row['Mô tả chi tiết'],
          quantity: Number(row['Số Lượng']),
          unit: row['ĐVT'],
          unitPrice: Number(row['Đơn giá']),
          note: row['Ghi chú'] || ''
        }))
        
        setItems(importedItems)
      }
      reader.readAsArrayBuffer(file)
    }
  }

  const generatePDF = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Add Vietnamese font
    doc.addFont('/fonts/arial-unicode-ms.ttf', 'Arial Unicode MS', 'normal');
    doc.setFont('Arial Unicode MS');

    // Set margins
    const margin = 10;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Add header
    doc.setFontSize(18);
    doc.text('BÁO GIÁ THI CÔNG NỘI THẤT', pageWidth / 2, margin + 10, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text('XƯỞNG SX - NỘI THẤT - THÂN THIỆN', margin, margin + 20);
    doc.text('Địa chỉ: Khu B4, Phường Đông Xuyên', margin, margin + 26);
    doc.text('Hotline: 0918306813 - 0988288701', margin, margin + 32);
    doc.text('Email: vitinhlx@gmail.com', margin, margin + 38);

    doc.text('Hạng mục:', pageWidth - margin - 50, margin + 20);
    doc.text('Khách hàng:', pageWidth - margin - 50, margin + 26);
    doc.text('Địa chỉ:', pageWidth - margin - 50, margin + 32);
    doc.text('Điện thoại:', pageWidth - margin - 50, margin + 38);

    // Add table
    if (items.length > 0) {
      try {
        doc.autoTable({
          startY: margin + 45,
          head: [['STT', 'Mô tả chi tiết', 'SL', 'ĐV', 'Đơn giá', 'Thành tiền', 'Ghi chú']],
          body: items.map(item => [
            item.id,
            item.description,
            item.quantity,
            item.unit,
            item.unitPrice.toLocaleString('vi-VN'),
            (item.quantity * item.unitPrice).toLocaleString('vi-VN'),
            item.note
          ]),
          foot: [['', '', '', '', '', 'TỔNG CỘNG', items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0).toLocaleString('vi-VN')]],
          styles: { font: 'Arial Unicode MS', fontSize: 10 },
          headStyles: { fillColor: [200, 200, 200], textColor: 0, fontStyle: 'bold' },
          footStyles: { fillColor: [200, 200, 200], textColor: 0, fontStyle: 'bold' },
          margin: { top: margin, right: margin, bottom: margin, left: margin },
        });
      } catch (error) {
        console.error('Error generating table:', error);
        doc.text('Lỗi khi tạo bảng dữ liệu', pageWidth / 2, margin + 45, { align: 'center' });
      }
    } else {
      doc.setFontSize(14);
      doc.text('Không có dữ liệu', pageWidth / 2, margin + 45, { align: 'center' });
    }

    // Add footer
    const footerY = pageHeight - margin - 50;
    doc.setFontSize(10);
    doc.text('Ghi chú:', margin, footerY);
    doc.setFontSize(8);
    const notes = [
      '* Tiến độ hoàn thành công trình 15 - 20 ngày kể từ khi nhận bàn giao mặt bằng đã hoàn chỉnh các hạng mục (lát gạch nền, sơn bê tường, đóng trần lao phong )',
      '* Sản phẩm gỗ nội thất được bảo hành kỹ thuật 12 tháng (lỗi do kỹ thuật thi công: rơi vỡ, rung lắc,...)',
      '* Không bảo hành nước, mối mọt đối với vật liệu gỗ.',
      '* Bảng báo giá trên có hiệu lực 30 ngày kể từ ngày báo giá, sẽ có điều chỉnh dựa trên tình hình giá cả vật tư tăng giảm(nếu có). Cảm ơn Quí khách hàng đã tin tưởng và ủng hộ !!!',
      '* Thông tin số tài khoản : 0.5555.1368  -  Nguyễn Phước Vĩnh Thành - Ngân Hàng : Nam Á Bank'
    ];
    notes.forEach((note, index) => {
      doc.text(note, margin, footerY + 6 + (index * 4), { maxWidth: pageWidth - (margin * 2) });
    });

    doc.save('bang_bao_gia.pdf');
  }

  const printQuotation = () => {
    if (printContentRef.current) {
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        const content = printContentRef.current.cloneNode(true) as HTMLElement;
        const actionCells = content.querySelectorAll('th:last-child, td:last-child');
        actionCells.forEach(cell => cell.remove());

        printWindow.document.write(`
          <html>
            <head>
              <title>Bảng Báo Giá</title>
              <style>
                body { font-family: Arial, sans-serif; }
                .header { text-align: center; margin-bottom: 20px; }
                .header h1 { margin-bottom: 10px; }
                .header p { margin: 5px 0; }
                table { 
                  width: 100%; 
                  border-collapse: collapse; 
                  margin-bottom: 2rem; 
                }
                th, td { border: 1px solid black; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                .total { 
                  text-align: right; 
                  margin-top: 2rem; 
                  padding-top: 1rem; 
                }
                .notes { margin-top: 20px; }
                .notes h2 { margin-bottom: 10px; }
                .notes ul { padding-left: 20px; }
              </style>
            </head>
            <body>
              ${content.innerHTML}
            </body>
          </html>
        `)
        printWindow.document.close()
        printWindow.print()
      }
    }
  }

  const deleteTemplate = (templateName: string) => {
    const updatedTemplates = templates.filter(t => t.name !== templateName);
    setTemplates(updatedTemplates);
    localStorage.setItem('quotationTemplates', JSON.stringify(updatedTemplates));
  }

  const saveNotes = () => {
    setEditableNotes(tempNotes)
    localStorage.setItem('quotationNotes', JSON.stringify(tempNotes))
    setIsEditingNotes(false)
  }

  const startEditingNotes = () => {
    setTempNotes([...editableNotes])
    setIsEditingNotes(true)
  }

  const addNote = () => {
    setTempNotes([...tempNotes, ''])
  }

  const updateNote = (index: number, value: string) => {
    const updated = [...tempNotes]
    updated[index] = value
    setTempNotes(updated)
  }

  const deleteNote = (index: number) => {
    const updated = tempNotes.filter((_, i) => i !== index)
    setTempNotes(updated)
  }

  const startEditingFactory = () => {
    setTempPageTitle(pageTitle)
    setTempFactoryName(factoryName)
    setTempFactoryAddress(factoryAddress)
    setTempFactoryHotline(factoryHotline)
    setTempFactoryEmail(factoryEmail)
    setIsEditingFactory(true)
  }

  const saveFactory = () => {
    setPageTitle(tempPageTitle)
    setFactoryName(tempFactoryName)
    setFactoryAddress(tempFactoryAddress)
    setFactoryHotline(tempFactoryHotline)
    setFactoryEmail(tempFactoryEmail)
    localStorage.setItem('pageTitle', tempPageTitle)
    localStorage.setItem('factoryInfo', JSON.stringify({
      name: tempFactoryName,
      address: tempFactoryAddress,
      hotline: tempFactoryHotline,
      email: tempFactoryEmail
    }))
    setIsEditingFactory(false)
  }

  const numberToVietnameseWords = (number: number): string => {
    const units = ['', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín']
    const positions = ['', 'nghìn', 'triệu', 'tỷ']
    
    if (number === 0) return 'không'
    
    const groups: string[] = []
    let numStr = Math.floor(number).toString()
    
    // Pad with zeros to make length divisible by 3
    while (numStr.length % 3 !== 0) {
      numStr = '0' + numStr
    }
    
    // Split into groups of 3
    for (let i = 0; i < numStr.length; i += 3) {
      const group = numStr.substr(i, 3)
      if (group !== '000') {
        const hundreds = parseInt(group[0])
        const tens = parseInt(group[1])
        const ones = parseInt(group[2])
        
        let groupWords = ''
        
        if (hundreds > 0) {
          groupWords += units[hundreds] + ' trăm '
        }
        
        if (tens > 0) {
          if (tens === 1) {
            groupWords += 'mười '
          } else {
            groupWords += units[tens] + ' mươi '
          }
        }
        
        if (ones > 0) {
          if (tens === 0 && hundreds !== 0) {
            groupWords += 'lẻ '
          }
          if (ones === 1 && tens > 1) {
            groupWords += 'mốt '
          } else if (ones === 5 && tens > 0) {
            groupWords += 'lăm '
          } else {
            groupWords += units[ones] + ' '
          }
        }
        
        const position = positions[Math.floor((numStr.length - i - 3) / 3)]
        groups.push(groupWords + position)
      }
    }
    
    return groups.join(' ').trim() + ' đồng'
  }

  return (
    <div className="container mx-auto p-4">
      <div ref={printContentRef}>
        <div className="mb-8 text-center header">
          <h1 className="text-3xl font-bold mb-2">{pageTitle}</h1>
          <div className="flex justify-between items-start mb-4">
            <div className="text-sm flex-1">
              <p>{factoryName}</p>
              <p>{factoryAddress}</p>
              <p>{factoryHotline}</p>
              <p>{factoryEmail}</p>
            </div>
            <Button variant="outline" size="sm" onClick={startEditingFactory} className="print:hidden">
              Chỉnh sửa thông tin xưởng
            </Button>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>STT</TableHead>
              <TableHead>Mô tả chi tiết</TableHead>
              <TableHead>Số Lượng</TableHead>
              <TableHead>ĐVT</TableHead>
              <TableHead>Đơn giá</TableHead>
              <TableHead>Thành tiền</TableHead>
              <TableHead>Ghi chú</TableHead>
              <TableHead>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.id}</TableCell>
                <TableCell>{item.description}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>{item.unit}</TableCell>
                <TableCell>{item.unitPrice.toLocaleString('vi-VN')}</TableCell>
                <TableCell>{(item.quantity * item.unitPrice).toLocaleString('vi-VN')}</TableCell>
                <TableCell>{item.note}</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" onClick={() => editItem(item)}>Sửa</Button>
                  <Button variant="destructive" size="sm" onClick={() => deleteItem(item.id)}>Xóa</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        <div className="mt-16 space-y-2">
          <div className="text-left bg-red-100 p-2 rounded">
            <strong>Tổng cộng: </strong>
            {items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0).toLocaleString('vi-VN')}
          </div>
          <div className="text-right italic">
            Bằng chữ: {numberToVietnameseWords(items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0))}
          </div>
        </div>
        <div className="mt-8 text-sm notes">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-bold">Ghi chú:</h2>
            <Button variant="outline" size="sm" onClick={startEditingNotes} className="print:hidden">
              Chỉnh sửa ghi chú
            </Button>
          </div>
          <ul className="list-disc list-inside space-y-1">
            {editableNotes.map((note, index) => (
              <li key={index}>{note}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="relative">
          <Label htmlFor="description">Mô tả chi tiết</Label>
          <Input
            id="description"
            ref={descriptionRef}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Nhập hoặc chọn mô tả"
            className="w-full"
          />
          {suggestions.length > 0 && (
            <ul className="absolute z-10 w-full bg-white border border-gray-300 mt-1 max-h-60 overflow-auto">
              {suggestions.map((item, index) => (
                <li
                  key={index}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setDescription(item)
                    setSuggestions([])
                  }}
                >
                  {item}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <Label htmlFor="quantity">Số Lượng</Label>
          <Input
            id="quantity"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Nhập số lượng"
          />
        </div>
        <div className="relative">
          <Label htmlFor="unit">ĐVT</Label>
          <Input
            id="unit"
            value={unit}
            onChange={(e) => {
              setUnit(e.target.value)
              setUnitSuggestions(suggestedUnits.filter(u => u.toLowerCase().includes(e.target.value.toLowerCase())))
            }}
            placeholder="Nhập đơn vị tính"
          />
          {unitSuggestions.length > 0 && (
            <ul className="absolute z-10 w-full bg-white border border-gray-300 mt-1 max-h-60 overflow-auto">
              {unitSuggestions.map((item, index) => (
                <li
                  key={index}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setUnit(item)
                    setUnitSuggestions([])
                  }}
                >
                  {item}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <Label htmlFor="unitPrice">Đơn giá</Label>
          <Input
            id="unitPrice"
            type="number"
            value={unitPrice}
            onChange={(e) => setUnitPrice(e.target.value)}
            placeholder="Nhập đơn giá"
          />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="note">Ghi chú</Label>
          <Input
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Nhập ghi chú"
          />
        </div>
      </div>
      <Button onClick={addItem} className="mb-4">{editingItem ? 'Cập nhật' : 'Thêm mục'}</Button>

      <div className="mt-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Tên mẫu báo giá"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
          />
          <Button onClick={saveTemplate}>Lưu mẫu</Button>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Tải mẫu</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Chọn mẫu báo giá</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              {templates.map((template, index) => (
                <div key={index} className="flex justify-between items-center">
                  <Button
                    variant="outline"
                    onClick={() => loadTemplate(template)}
                    className="w-full justify-start"
                  >
                    {template.name}
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => deleteTemplate(template.name)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                  </Button>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-4 flex justify-end space-x-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={importFromExcel}
          accept=".xlsx, .xls"
          style={{ display: 'none' }}
        />
        <Button onClick={() => fileInputRef.current?.click()}>Nhập từ Excel</Button>
        <Button onClick={exportToExcel}>Xuất Excel</Button>
        <Button onClick={generatePDF}>Xuất PDF</Button>
        <Button onClick={printQuotation}>In trực tiếp</Button>
      </div>
      <Dialog open={isEditingNotes} onOpenChange={setIsEditingNotes}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa ghi chú</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {tempNotes.map((note, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={note}
                  onChange={(e) => updateNote(index, e.target.value)}
                  placeholder={`Ghi chú ${index + 1}`}
                  className="flex-1"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => deleteNote(index)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                </Button>
              </div>
            ))}
            <Button onClick={addNote} variant="outline" className="w-full">
              Thêm ghi chú mới
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditingNotes(false)}>
              Hủy
            </Button>
            <Button onClick={saveNotes}>
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditingFactory} onOpenChange={setIsEditingFactory}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa thông tin xưởng</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="pageTitle">Tiêu đề lớn</Label>
              <Input
                id="pageTitle"
                value={tempPageTitle}
                onChange={(e) => setTempPageTitle(e.target.value)}
                placeholder="Nhập tiêu đề"
              />
            </div>
            <div>
              <Label htmlFor="factoryName">Tên xưởng</Label>
              <Input
                id="factoryName"
                value={tempFactoryName}
                onChange={(e) => setTempFactoryName(e.target.value)}
                placeholder="Nhập tên xưởng"
              />
            </div>
            <div>
              <Label htmlFor="factoryAddress">Địa chỉ</Label>
              <Input
                id="factoryAddress"
                value={tempFactoryAddress}
                onChange={(e) => setTempFactoryAddress(e.target.value)}
                placeholder="Nhập địa chỉ"
              />
            </div>
            <div>
              <Label htmlFor="factoryHotline">Hotline</Label>
              <Input
                id="factoryHotline"
                value={tempFactoryHotline}
                onChange={(e) => setTempFactoryHotline(e.target.value)}
                placeholder="Nhập hotline"
              />
            </div>
            <div>
              <Label htmlFor="factoryEmail">Email</Label>
              <Input
                id="factoryEmail"
                value={tempFactoryEmail}
                onChange={(e) => setTempFactoryEmail(e.target.value)}
                placeholder="Nhập email"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditingFactory(false)}>
              Hủy
            </Button>
            <Button onClick={saveFactory}>
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
