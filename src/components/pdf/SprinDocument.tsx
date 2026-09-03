'use client';

import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { DIVISION_LABELS, SPRIN_TYPE_LABELS } from '@/lib/utils';
import { Division, SprinType } from '@prisma/client';

// Register a standard font
Font.register({
  family: 'Times New Roman',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/timesnewroman/v1/times_new_roman.ttf' },
  ],
});

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    paddingHorizontal: 60,
    paddingVertical: 50,
    backgroundColor: '#FFFFFF',
  },
  // KOP SURAT
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottom: '2 solid #000000',
    paddingBottom: 8,
    marginBottom: 6,
  },
  headerLeft: {
    width: 70,
    alignItems: 'center',
  },
  logoPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1a3a6e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: { color: '#FFFFFF', fontSize: 8, fontFamily: 'Helvetica-Bold', textAlign: 'center' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle1: { fontSize: 10, fontFamily: 'Helvetica', letterSpacing: 1 },
  headerTitle2: { fontSize: 14, fontFamily: 'Helvetica-Bold', letterSpacing: 2, marginTop: 2 },
  headerTitle3: { fontSize: 10, fontFamily: 'Helvetica', letterSpacing: 1 },
  headerAddress: { fontSize: 7, color: '#444444', marginTop: 3, textAlign: 'center' },
  // DOCUMENT TITLE
  docTitleContainer: { alignItems: 'center', marginTop: 14, marginBottom: 4 },
  docTitle: { fontSize: 12, fontFamily: 'Helvetica-Bold', textDecoration: 'underline', letterSpacing: 1 },
  docSubtitle: { fontSize: 9, marginTop: 2, color: '#333' },
  sprinNumber: { fontSize: 9, color: '#333', marginTop: 1 },
  // SECTIONS
  sectionLabel: { fontFamily: 'Helvetica-Bold', fontSize: 9, marginBottom: 3 },
  sectionText: { fontSize: 9, lineHeight: 1.6, textAlign: 'justify' },
  // DASAR
  dasarContainer: { marginTop: 12 },
  dasarItem: { flexDirection: 'row', marginBottom: 2 },
  dasarNum: { width: 20, fontSize: 9 },
  dasarText: { flex: 1, fontSize: 9, lineHeight: 1.5 },
  // ISINYA
  isiContainer: { marginTop: 10 },
  isiHeader: { fontFamily: 'Helvetica-Bold', fontSize: 9, textAlign: 'center', marginBottom: 6 },
  isiText: { fontSize: 9, lineHeight: 1.6 },
  // TABLE
  tableContainer: { marginTop: 10 },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1a3a6e',
    paddingHorizontal: 6,
    paddingVertical: 5,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '0.5 solid #cccccc',
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  tableRowAlt: {
    flexDirection: 'row',
    borderBottom: '0.5 solid #cccccc',
    backgroundColor: '#f8f9ff',
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  colNo: { width: '8%' },
  colNRP: { width: '17%' },
  colName: { width: '35%' },
  colJabatan: { width: '25%' },
  colDiv: { width: '15%' },
  colHeaderText: { color: '#FFFFFF', fontFamily: 'Helvetica-Bold', fontSize: 8 },
  colText: { fontSize: 8, color: '#222' },
  // CLOSING
  closingContainer: { marginTop: 18 },
  closingText: { fontSize: 9, lineHeight: 1.6, textAlign: 'justify' },
  // SIGNATURE
  signatureContainer: { marginTop: 20, flexDirection: 'row', justifyContent: 'space-between' },
  signatureBox: { width: '45%', alignItems: 'center' },
  signatureTitle: { fontSize: 9, textAlign: 'center' },
  signatureName: { fontFamily: 'Helvetica-Bold', fontSize: 9, textAlign: 'center', textDecoration: 'underline', marginTop: 40 },
  signatureNRP: { fontSize: 8, textAlign: 'center', color: '#555' },
  // FOOTER
  footerLine: { borderTop: '1 solid #000', marginTop: 20, paddingTop: 4 },
  footerText: { fontSize: 7, color: '#666', textAlign: 'center' },
});

interface SprinDocumentProps {
  sprin: {
    sprinNumber: string;
    type: string;
    title: string;
    description?: string | null;
    dasar?: string | null;
    startDate: Date | string;
    endDate: Date | string;
    createdAt: Date | string;
    createdBy: { name: string; division: string };
    assignments: Array<{
      personel: { nrp: string; name: string; rank: string; jabatan: string; division: string };
    }>;
  };
}

const ROMAN_MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

function formatID(date: Date | string) {
  const d = new Date(date);
  return `${d.getDate()} ${ROMAN_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

const DEFAULT_DASAR = `1. Undang-Undang RI Nomor 2 Tahun 2002 tentang Kepolisian Negara Republik Indonesia;
2. Peraturan Kapolri Nomor 22 Tahun 2010 tentang Susunan Organisasi dan Tata Kerja pada Tingkat Markas Besar Kepolisian Negara Republik Indonesia;
3. Rencana Kegiatan Pusat Penelitian dan Pengembangan Polri.`;

export function SprinDocument({ sprin }: SprinDocumentProps) {
  const activeAssignments = sprin.assignments.filter((a: any) => a.status !== 'CANCELLED' && a.status !== 'OVERRIDDEN');
  const dasarLines = (sprin.dasar || DEFAULT_DASAR).split('\n').filter(Boolean);
  const now = new Date();
  const dateStr = formatID(now);
  const divLabel = DIVISION_LABELS[sprin.createdBy.division as Division] || sprin.createdBy.division;
  const typeLabel = SPRIN_TYPE_LABELS[sprin.type as SprinType] || sprin.type;

  return (
    <Document title={`${sprin.sprinNumber} - ${sprin.title}`} author="Sistem SPRIN Puslitbang Polri">
      <Page size="A4" style={styles.page}>
        {/* KOP SURAT */}
        <View style={styles.headerContainer}>
          <View style={styles.headerLeft}>
            <View style={styles.logoPlaceholder}>
              <Text style={styles.logoText}>POLRI{'\n'}PUSLIT{'\n'}BANG</Text>
            </View>
          </View>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle1}>KEPOLISIAN NEGARA REPUBLIK INDONESIA</Text>
            <Text style={styles.headerTitle2}>PUSAT PENELITIAN DAN PENGEMBANGAN</Text>
            <Text style={styles.headerTitle3}>BADAN PENELITIAN DAN PENGEMBANGAN SDM</Text>
            <Text style={styles.headerAddress}>
              Jl. Trunojoyo No. 3, Kebayoran Baru, Jakarta Selatan 12110{'\n'}
              Telp. (021) 7243932  |  Fax. (021) 7243932
            </Text>
          </View>
        </View>

        {/* DOCUMENT TITLE */}
        <View style={styles.docTitleContainer}>
          <Text style={styles.docTitle}>{typeLabel.toUpperCase()}</Text>
          <Text style={styles.sprinNumber}>{sprin.sprinNumber}</Text>
        </View>

        {/* DASAR */}
        <View style={styles.dasarContainer}>
          <Text style={styles.sectionLabel}>Dasar :</Text>
          {dasarLines.map((line, i) => (
            <View key={i} style={styles.dasarItem}>
              <Text style={styles.dasarText}>{line}</Text>
            </View>
          ))}
        </View>

        {/* ISI */}
        <View style={styles.isiContainer}>
          <Text style={styles.sectionLabel}>Memberikan Perintah kepada :</Text>
        </View>

        {/* PERSONEL TABLE */}
        <View style={styles.tableContainer}>
          {/* Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.colNo, styles.colHeaderText]}>No</Text>
            <Text style={[styles.colNRP, styles.colHeaderText]}>NRP</Text>
            <Text style={[styles.colName, styles.colHeaderText]}>Nama / Pangkat</Text>
            <Text style={[styles.colJabatan, styles.colHeaderText]}>Jabatan</Text>
            <Text style={[styles.colDiv, styles.colHeaderText]}>Bagian</Text>
          </View>
          {/* Rows */}
          {(activeAssignments.length > 0 ? activeAssignments : sprin.assignments).map((a, i) => (
            <View key={i} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
              <Text style={[styles.colNo, styles.colText]}>{i + 1}</Text>
              <Text style={[styles.colNRP, styles.colText]}>{a.personel.nrp}</Text>
              <Text style={[styles.colName, styles.colText]}>{a.personel.rank} {a.personel.name}</Text>
              <Text style={[styles.colJabatan, styles.colText]}>{a.personel.jabatan}</Text>
              <Text style={[styles.colDiv, styles.colText]}>
                {DIVISION_LABELS[a.personel.division as Division]?.split(' ')[0] || a.personel.division}
              </Text>
            </View>
          ))}
        </View>

        {/* TUGAS */}
        <View style={styles.closingContainer}>
          <Text style={styles.sectionLabel}>Untuk :</Text>
          <Text style={styles.closingText}>
            {sprin.title}
          </Text>
          <Text style={[styles.closingText, { marginTop: 6 }]}>
            Periode Pelaksanaan : {formatID(sprin.startDate)} sampai dengan {formatID(sprin.endDate)}
          </Text>
          {sprin.description && (
            <Text style={[styles.closingText, { marginTop: 4, color: '#555' }]}>
              Keterangan : {sprin.description}
            </Text>
          )}
          <Text style={[styles.closingText, { marginTop: 8 }]}>
            Demikian Surat Perintah ini dibuat untuk dilaksanakan dengan penuh rasa tanggung jawab.
          </Text>
        </View>

        {/* DATE & PLACE */}
        <View style={{ marginTop: 14, alignItems: 'flex-end' }}>
          <Text style={{ fontSize: 9 }}>Jakarta, {dateStr}</Text>
        </View>

        {/* SIGNATURE */}
        <View style={styles.signatureContainer}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureTitle}>Mengetahui,</Text>
            <Text style={styles.signatureTitle}>Kepala Puslitbang Polri</Text>
            <Text style={[styles.signatureName, { marginTop: 40 }]}>________________________</Text>
            <Text style={[styles.signatureNRP, { marginTop: 2 }]}>(Tanda Tangan & Stempel)</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureTitle}>Operator {divLabel},</Text>
            <Text style={[styles.signatureName, { marginTop: 40 }]}>{sprin.createdBy.name}</Text>
          </View>
        </View>

        {/* FOOTER */}
        <View style={styles.footerLine}>
          <Text style={styles.footerText}>
            Dicetak oleh Sistem SPRIN Puslitbang Polri | {dateStr} | Dokumen ini sah dengan tanda tangan pejabat berwenang
          </Text>
        </View>
      </Page>
    </Document>
  );
}
