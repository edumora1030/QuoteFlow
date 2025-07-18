import { supabase } from '../lib/supabase'
import { Quotation, QuotationFile } from '../types'

export const quotationService = {
  async getQuotations(): Promise<Quotation[]> {
    try {
      const { data, error } = await supabase
        .from('quotations')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching quotations:', error)
        return []
      }

      return data.map(this.mapSupabaseToQuotation)
    } catch (error) {
      console.error('Error fetching quotations:', error)
      return []
    }
  },

  async createQuotation(quotation: Omit<Quotation, 'id'>, userId: string): Promise<Quotation | null> {
    try {
      const { data, error } = await supabase
        .from('quotations')
        .insert({
          title: quotation.title,
          client: quotation.client,
          amount: quotation.amount,
          date: quotation.date,
          status: quotation.status,
          description: quotation.description,
          purchase_order_created: quotation.purchaseOrderCreated,
          invoice_generated: quotation.invoiceGenerated,
          invoice_paid: quotation.invoicePaid,
          purchase_order_file: quotation.purchaseOrderFile,
          invoice_file: quotation.invoiceFile,
          created_by: userId
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating quotation:', error)
        return null
      }

      return this.mapSupabaseToQuotation(data)
    } catch (error) {
      console.error('Error creating quotation:', error)
      return null
    }
  },

  async updateQuotation(quotation: Quotation): Promise<Quotation | null> {
    try {
      const { data, error } = await supabase
        .from('quotations')
        .update({
          title: quotation.title,
          client: quotation.client,
          amount: quotation.amount,
          date: quotation.date,
          status: quotation.status,
          description: quotation.description,
          purchase_order_created: quotation.purchaseOrderCreated,
          invoice_generated: quotation.invoiceGenerated,
          invoice_paid: quotation.invoicePaid,
          purchase_order_file: quotation.purchaseOrderFile,
          invoice_file: quotation.invoiceFile,
          updated_at: new Date().toISOString()
        })
        .eq('id', quotation.id)
        .select()

      if (error) {
        console.error('Error updating quotation:', error)
        return null
      }

      if (!data || data.length === 0) {
        console.error('No quotation found with the given ID')
        return null
      }

      return this.mapSupabaseToQuotation(data[0])
    } catch (error) {
      console.error('Error updating quotation:', error)
      return null
    }
  },

  async deleteQuotation(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('quotations')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting quotation:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error deleting quotation:', error)
      return false
    }
  },

  mapSupabaseToQuotation(data: any): Quotation {
    return {
      id: data.id,
      title: data.title,
      client: data.client,
      amount: data.amount,
      date: data.date,
      status: data.status,
      description: data.description,
      purchaseOrderCreated: data.purchase_order_created,
      invoiceGenerated: data.invoice_generated,
      invoicePaid: data.invoice_paid,
      purchaseOrderFile: data.purchase_order_file,
      invoiceFile: data.invoice_file
    }
  }
}